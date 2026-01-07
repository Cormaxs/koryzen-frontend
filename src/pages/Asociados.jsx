import { useState, useEffect, useCallback } from "react";
import { Modal, Button, Table, Form, Badge, Card, Row, Col, Pagination, Spinner, Container, Stack } from "react-bootstrap";
import api from "../Api/axios.js";

// Design System Tokens
const STYLES = {
  mainBg: { backgroundColor: "#F8F9FA", minHeight: "100vh" },
  textPrimary: { color: "#212529" },
  textSecondary: { color: "#64748B" }, // Slate 500
  brandAction: { backgroundColor: "#0F172A", border: "none", borderRadius: "6px" }, // Navy Slate
  tableHeader: { backgroundColor: "#F8FAFC", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.05em" },
  mono: { fontFamily: "'JetBrains Mono', 'SFMono-Regular', monospace", fontSize: "0.85rem" }
};

export default function Asociados() {
  const [asociados, setAsociados] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [filtros, setFiltros] = useState({
    nombre: "", dni: "", status: "", fechaInicio: "", fechaFin: ""
  });
  const [pagination, setPagination] = useState({
    currentPage: 1, totalPages: 1, limit: 10
  });

  const [showModal, setShowModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [asociadoEditandoId, setAsociadoEditandoId] = useState(null);
  const [nuevoAsociado, setNuevoAsociado] = useState({
    fullName: "", documentId: "", type: "socio", status: "activo",
  });

  const [showPagosModal, setShowPagosModal] = useState(false);
  const [asociadoSeleccionado, setAsociadoSeleccionado] = useState(null);
  const [historialPagos, setHistorialPagos] = useState([]);
  const [nuevoPago, setNuevoPago] = useState({
    associateId: "", month: new Date().getMonth() + 1, year: new Date().getFullYear(), amount: 0, notes: "",
  });

  const fetchAsociados = useCallback(async () => {
    try {
      setLoading(true);
      const { nombre, dni, status, fechaInicio, fechaFin } = filtros;
      const { currentPage, limit } = pagination;

      const params = new URLSearchParams({
        page: currentPage,
        limit: limit,
        ...(nombre && { nombre }),
        ...(dni && { dni }),
        ...(status && { status }),
        ...(fechaInicio && { fechaInicio }),
        ...(fechaFin && { fechaFin }),
      });

      const res = await api.get(`/asociados/search?${params.toString()}`);
      if (res.data.ok) {
        setAsociados(res.data.asociados);
        setPagination(prev => ({
          ...prev,
          totalPages: res.data.pagination.totalPages,
          currentPage: res.data.pagination.currentPage
        }));
      }
    } catch (err) {
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  }, [filtros, pagination.currentPage, pagination.limit]);

  useEffect(() => { fetchAsociados(); }, [fetchAsociados]);

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const limpiarFiltros = () => {
    setFiltros({ nombre: "", dni: "", status: "", fechaInicio: "", fechaFin: "" });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleShowModal = () => {
    setNuevoAsociado({ fullName: "", documentId: "", type: "socio", status: "activo" });
    setModoEdicion(false);
    setShowModal(true);
  };

  const handleEditar = (asociado) => {
    setNuevoAsociado({ fullName: asociado.fullName, documentId: asociado.documentId, type: asociado.type, status: asociado.status });
    setAsociadoEditandoId(asociado._id);
    setModoEdicion(true);
    setShowModal(true);
  };

  const handleGuardarAsociado = async () => {
    try {
      if (modoEdicion) { await api.put(`/asociados/${asociadoEditandoId}`, nuevoAsociado); }
      else { await api.post("/asociados", nuevoAsociado); }
      setShowModal(false);
      fetchAsociados();
    } catch (err) { alert("Error"); }
  };

  const toggleEstado = async (id) => {
    try {
      await api.post(`/asociados/${id}/status`);
      fetchAsociados();
    } catch (err) { alert("Error"); }
  };

  const fetchHistorialPagos = async (id) => {
    try {
      const res = await api.get(`/asociados/payment/${id}`);
      setHistorialPagos(res.data);
    } catch (err) { setHistorialPagos([]); }
  };

  const handleOpenPagos = (asociado) => {
    setAsociadoSeleccionado(asociado);
    setNuevoPago({ associateId: asociado._id, month: new Date().getMonth() + 1, year: new Date().getFullYear(), amount: 0, notes: "" });
    fetchHistorialPagos(asociado._id);
    setShowPagosModal(true);
  };

  const handleRegistrarPago = async () => {
    try {
      await api.post("/asociados/payment", nuevoPago);
      fetchHistorialPagos(asociadoSeleccionado._id);
      setNuevoPago({ ...nuevoPago, amount: 0, notes: "" });
    } catch (err) { alert("Error"); }
  };

  return (
    <div style={STYLES.mainBg} className="pb-5">
      <Container fluid className="px-lg-5 pt-4">
        {/* HEADER ESTRATÉGICO */}
        <div className="d-flex justify-content-between align-items-end mb-5">
          <div>
            <h1 className="fw-bold h3 mb-1" style={STYLES.textPrimary}>Directorio de Asociados</h1>
            <p className="mb-0" style={STYLES.textSecondary}>Control administrativo y flujo de membresías.</p>
          </div>
          <Button style={STYLES.brandAction} className="px-4 py-2 shadow-sm text-white fw-medium" onClick={handleShowModal}>
            + Registrar Asociado
          </Button>
        </div>

        {/* FILTROS OPERATIVOS */}
        <Card className="border-0 shadow-sm mb-4 overflow-hidden">
          <Card.Body className="p-4 bg-white">
            <Row className="g-3">
              <Col lg={3}>
                <Form.Label className="text-uppercase fw-bold text-muted" style={{fontSize: '0.65rem'}}>Búsqueda por nombre</Form.Label>
                <Form.Control className="bg-light border-0 py-2" placeholder="Ej. Juan Pérez..." name="nombre" value={filtros.nombre} onChange={handleFiltroChange} />
              </Col>
              <Col lg={2}>
                <Form.Label className="text-uppercase fw-bold text-muted" style={{fontSize: '0.65rem'}}>Documento</Form.Label>
                <Form.Control className="bg-light border-0 py-2" placeholder="DNI..." name="dni" value={filtros.dni} onChange={handleFiltroChange} />
              </Col>
              <Col lg={2}>
                <Form.Label className="text-uppercase fw-bold text-muted" style={{fontSize: '0.65rem'}}>Estado</Form.Label>
                <Form.Select className="bg-light border-0 py-2 fw-medium" name="status" value={filtros.status} onChange={handleFiltroChange}>
                  <option value="">Cualquier estado</option>
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </Form.Select>
              </Col>
              <Col lg={4}>
                <Form.Label className="text-uppercase fw-bold text-muted" style={{fontSize: '0.65rem'}}>Rango de Registro</Form.Label>
                <Stack direction="horizontal" gap={2}>
                  <Form.Control type="date" className="bg-light border-0 py-2" name="fechaInicio" value={filtros.fechaInicio} onChange={handleFiltroChange} />
                  <Form.Control type="date" className="bg-light border-0 py-2" name="fechaFin" value={filtros.fechaFin} onChange={handleFiltroChange} />
                </Stack>
              </Col>
              <Col lg={1} className="d-flex align-items-end">
                <Button variant="link" className="text-secondary text-decoration-none w-100 p-0 mb-2" onClick={limpiarFiltros}><small>Limpiar</small></Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* DATA GRID PRINCIPAL */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <Card.Header className="bg-white border-0 pt-4 px-4 d-flex justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <span className="text-uppercase fw-bold text-muted" style={{fontSize: '0.65rem'}}>Mostrar:</span>
              <Form.Select size="sm" className="bg-light border-0 fw-bold" style={{ width: '70px' }} value={pagination.limit} onChange={(e) => setPagination({...pagination, limit: Number(e.target.value), currentPage: 1})}>
                <option value="10">10</option>
                <option value="50">50</option>
              </Form.Select>
            </div>
            {loading && <Spinner animation="border" size="sm" style={{color: '#0F172A'}} />}
          </Card.Header>

          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead style={STYLES.tableHeader}>
                <tr>
                  <th className="ps-4 py-3 text-secondary border-0">NOMBRE COMPLETO</th>
                  <th className="py-3 text-secondary border-0">DOCUMENTO</th>
                  <th className="py-3 text-secondary border-0">PERFIL</th>
                  <th className="py-3 text-secondary border-0">ESTADO</th>
                  <th className="text-end pe-4 py-3 text-secondary border-0">ACCIONES</th>
                </tr>
              </thead>
              <tbody style={{ opacity: loading ? 0.6 : 1, transition: "opacity 0.2s" }}>
                {asociados.map((a) => (
                  <tr key={a._id} className="border-bottom">
                    <td className="ps-4 py-3">
                      <div className="fw-bold" style={STYLES.textPrimary}>{a.fullName}</div>
                      <small style={STYLES.textSecondary}>ID: {a._id.substring(18)}</small>
                    </td>
                    <td className="py-3 fw-medium" style={STYLES.mono}>{a.documentId}</td>
                    <td className="py-3">
                      <Badge pill bg="light" className="text-secondary border fw-normal px-3 py-2">
                        {a.type.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <div className="d-flex align-items-center gap-2">
                        <div style={{width: '6px', height: '6px', borderRadius: '50%', backgroundColor: a.status === 'activo' ? '#10B981' : '#94A3B8'}}></div>
                        <span className="small text-uppercase fw-semibold" style={{color: a.status === 'activo' ? '#065F46' : '#64748B'}}>
                          {a.status}
                        </span>
                      </div>
                    </td>
                    <td className="text-end pe-4 py-3">
                      <Stack direction="horizontal" gap={2} className="justify-content-end">
                        <Button variant="link" className="text-secondary p-0 text-decoration-none small" onClick={() => handleEditar(a)}>Editar</Button>
                        <Button variant="link" className="text-primary p-0 text-decoration-none small fw-bold" onClick={() => handleOpenPagos(a)}>Pagos $</Button>
                        <Button variant="link" className={`p-0 text-decoration-none small ${a.status === 'activo' ? 'text-danger opacity-50' : 'text-success'}`} onClick={() => toggleEstado(a._id)}>
                          {a.status === 'activo' ? 'Suspender' : 'Reactivar'}
                        </Button>
                      </Stack>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          <Card.Footer className="bg-white border-top-0 py-4 px-4 d-flex justify-content-between align-items-center">
            <small className="text-secondary">Página {pagination.currentPage} de {pagination.totalPages}</small>
            <Pagination size="sm" className="mb-0 border-0">
              <Pagination.Prev onClick={() => setPagination({...pagination, currentPage: pagination.currentPage - 1})} disabled={pagination.currentPage === 1} />
              <Pagination.Item active className="border-0 px-3">{pagination.currentPage}</Pagination.Item>
              <Pagination.Next onClick={() => setPagination({...pagination, currentPage: pagination.currentPage + 1})} disabled={pagination.currentPage === pagination.totalPages} />
            </Pagination>
          </Card.Footer>
        </Card>
      </Container>

      {/* MODAL: FORMULARIO ASOCIADO */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="border-0 px-4 pt-4">
          <Modal.Title className="fw-bold h5">{modoEdicion ? "Actualizar Registro" : "Nuevo Expediente de Socio"}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-4">
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="text-uppercase fw-bold text-muted" style={{fontSize: '0.65rem'}}>Nombre Completo</Form.Label>
              <Form.Control className="bg-light border-0 py-2 fw-medium" value={nuevoAsociado.fullName} onChange={(e) => setNuevoAsociado({ ...nuevoAsociado, fullName: e.target.value })} />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-uppercase fw-bold text-muted" style={{fontSize: '0.65rem'}}>Documento ID</Form.Label>
                  <Form.Control className="bg-light border-0 py-2 fw-medium" disabled={modoEdicion} value={nuevoAsociado.documentId} onChange={(e) => setNuevoAsociado({ ...nuevoAsociado, documentId: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-uppercase fw-bold text-muted" style={{fontSize: '0.65rem'}}>Tipo de Perfil</Form.Label>
                  <Form.Select className="bg-light border-0 py-2 fw-medium" value={nuevoAsociado.type} onChange={(e) => setNuevoAsociado({ ...nuevoAsociado, type: e.target.value })}>
                    <option value="socio">Socio</option>
                    <option value="cliente_vip">Cliente VIP</option>
                    <option value="proveedor">Proveedor</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 px-4 pb-4">
          <Button variant="link" className="text-secondary text-decoration-none" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button style={STYLES.brandAction} className="px-4 text-white" onClick={handleGuardarAsociado}>Confirmar Cambios</Button>
        </Modal.Footer>
      </Modal>

      {/* MODAL: PAGOS EMPRESARIAL */}
      <Modal show={showPagosModal} onHide={() => setShowPagosModal(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0 px-4 pt-4">
          <Modal.Title className="fw-bold h5">Gestión de Cuenta: <span className="text-muted fw-normal">{asociadoSeleccionado?.fullName}</span></Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-4">
          <div className="bg-light p-4 rounded-3 mb-4 border">
            <h6 className="text-uppercase fw-bold mb-3" style={{fontSize: '0.7rem'}}>Nueva Transacción de Cobro</h6>
            <Row className="g-2">
              <Col md={3}><Form.Control type="number" className="border-0 shadow-sm py-2" placeholder="Mes" value={nuevoPago.month} onChange={(e) => setNuevoPago({...nuevoPago, month: Number(e.target.value)})} /></Col>
              <Col md={3}><Form.Control type="number" className="border-0 shadow-sm py-2" placeholder="Año" value={nuevoPago.year} onChange={(e) => setNuevoPago({...nuevoPago, year: Number(e.target.value)})} /></Col>
              <Col md={3}><Form.Control type="number" className="border-0 shadow-sm py-2 fw-bold text-primary" placeholder="Monto" value={nuevoPago.amount} onChange={(e) => setNuevoPago({...nuevoPago, amount: Number(e.target.value)})} /></Col>
              <Col md={3}><Button variant="dark" className="w-100 fw-bold border-0 py-2" onClick={handleRegistrarPago}>REGISTRAR</Button></Col>
              <Col md={12}><Form.Control type="text" className="border-0 shadow-sm mt-2" placeholder="Notas internas de la transacción..." value={nuevoPago.notes} onChange={(e) => setNuevoPago({...nuevoPago, notes: e.target.value})} /></Col>
            </Row>
          </div>

          <h6 className="text-uppercase fw-bold mb-3 text-muted" style={{fontSize: '0.7rem'}}>Historial de Movimientos</h6>
          <div className="table-responsive rounded border">
            <Table hover size="sm" className="mb-0">
              <thead style={STYLES.tableHeader}>
                <tr>
                  <th className="py-2 ps-3 border-0">PERIODO</th>
                  <th className="py-2 border-0 text-end">MONTO</th>
                  <th className="py-2 border-0">FECHA</th>
                  <th className="py-2 pe-3 border-0">OBSERVACIONES</th>
                </tr>
              </thead>
              <tbody>
                {historialPagos.map((p) => (
                  <tr key={p._id} className="small">
                    <td className="ps-3 py-2 fw-bold">{p.month}/{p.year}</td>
                    <td className="py-2 text-end fw-bold text-dark" style={STYLES.mono}>${p.amount.toLocaleString()}</td>
                    <td className="py-2 text-muted">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="py-2 pe-3 text-muted text-truncate" style={{maxWidth: '200px'}}>{p.notes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { Modal, Button, Table, Form, Card, InputGroup, Row, Col, Badge, Container, Stack, Pagination, Spinner } from "react-bootstrap";
import api from "../Api/axios";

// Estilos de diseño para jerarquía empresarial
const styles = {
  mainBg: { backgroundColor: "#F8F9FA", minHeight: "100vh" },
  cardTitle: { fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.05em", color: "#6C757D" },
  tableHeader: { backgroundColor: "#F1F3F5", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.05em" },
  mono: { fontFamily: "'SFMono-Regular', Consolas, monospace", fontSize: "0.85rem" },
  primaryAction: { backgroundColor: "#0F172A", border: "none", borderRadius: "6px" } // Azul Navy / Slate
};

export default function Inventario() {
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState("");
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);

  const [paginaActual, setPaginaActual] = useState(1);
  const [limite, setLimite] = useState(10);
  const [paginacionInfo, setPaginacionInfo] = useState({
    totalItems: 0,
    totalPages: 1,
    limit: 10
  });

  const [showModal, setShowModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoEditandoId, setProductoEditandoId] = useState(null);
  const [nuevoProducto, setNuevoProducto] = useState({
    name: "", sku: "", description: "", category: "",
    price: 0, stock: 0, minStock: 5, status: "activo",
  });

  const [showMovimientosModal, setShowMovimientosModal] = useState(false);
  const [movimientos, setMovimientos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [nuevoMovimiento, setNuevoMovimiento] = useState({
    type: "entrada", quantity: 0, reason: "compra", notes: "",
  });

  useEffect(() => {
    fetchProductos();
  }, [paginaActual, limite]);

  const fetchProductos = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/inventario/search?page=${paginaActual}&limit=${limite}`);
      setProductos(res.data.products || []);
      if (res.data.pagination) setPaginacionInfo(res.data.pagination);
    } catch (err) {
      setError("No se pudieron cargar los productos.");
    } finally {
      setLoading(false);
    }
  };

  const productosFiltrados = productos.filter((p) => {
    const t = filtro.toLowerCase();
    return p.name?.toLowerCase().includes(t) || p.sku?.toLowerCase().includes(t) || p.category?.toLowerCase().includes(t);
  });

  const cambiarPagina = (numero) => setPaginaActual(numero);
  const handleFiltroChange = (e) => { setFiltro(e.target.value); setPaginaActual(1); };
  const handleLimiteChange = (e) => { setLimite(Number(e.target.value)); setPaginaActual(1); };

  const handleShowAgregar = () => {
    setNuevoProducto({
      name: "", sku: "", description: "", category: "",
      price: 0, stock: 0, minStock: 5, status: "activo",
    });
    setModoEdicion(false);
    setShowModal(true);
  };

  const handleEditarProducto = (p) => {
    setNuevoProducto({
      name: p.name, sku: p.sku, description: p.description || "",
      category: p.category, price: p.price, stock: p.stock,
      minStock: p.minStock || 5, status: p.status || "activo",
    });
    setProductoEditandoId(p._id);
    setModoEdicion(true);
    setShowModal(true);
  };

  const handleGuardarProducto = async () => {
    try {
      if (modoEdicion) {
        const res = await api.put(`/inventario/${productoEditandoId}`, nuevoProducto);
        setProductos(productos.map((p) => (p._id === productoEditandoId ? res.data : p)));
      } else {
        await api.post("/inventario/products", nuevoProducto);
        fetchProductos();
      }
      setShowModal(false);
    } catch (err) { alert("Error: Verifique el código SKU."); }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Está seguro de eliminar este producto del sistema?")) return;
    try {
      await api.delete(`/inventario/${id}`);
      setProductos(productos.filter((p) => p._id !== id));
    } catch (err) { alert("Error al eliminar."); }
  };

  const handleVerMovimientos = async (producto) => {
    try {
      const res = await api.get(`/inventario/movements/history?productId=${producto._id}`);
      setMovimientos(res.data);
      setProductoSeleccionado(producto);
      setShowMovimientosModal(true);
    } catch (err) { alert("No se pudo cargar el historial."); }
  };

  const handleGuardarMovimiento = async () => {
    if (nuevoMovimiento.quantity <= 0) return alert("Ingrese una cantidad válida");
    try {
      const res = await api.post(`/inventario/products/${productoSeleccionado._id}/movement`, nuevoMovimiento);
      setMovimientos([res.data.movement || res.data, ...movimientos]);
      setProductos(productos.map((p) => p._id === productoSeleccionado._id ? (res.data.product || p) : p));
      setNuevoMovimiento({ type: "entrada", quantity: 0, reason: "compra", notes: "" });
    } catch (err) { alert("Error al registrar movimiento."); }
  };

  return (
    <div style={styles.mainBg} className="pb-5">
      <Container fluid className="px-lg-5 pt-4">
        {/* ENCABEZADO ESTRATÉGICO */}
        <header className="d-flex justify-content-between align-items-end mb-5">
          <div>
            <h1 className="fw-bold h3 mb-1" style={{ color: "#212529" }}>Inventario</h1>
            <p className="text-secondary mb-0 fw-light">Control de activos, existencias y flujo logístico.</p>
          </div>
          <Button style={styles.primaryAction} className="px-4 py-2 shadow-sm fw-medium text-white" onClick={handleShowAgregar}>
            + Nuevo Producto
          </Button>
        </header>

        {/* FILTROS Y RESUMEN DE ACTIVOS */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body className="p-4">
            <Row className="g-4 align-items-center">
              <Col lg={6}>
                <InputGroup className="bg-light border rounded-3 overflow-hidden">
                  <InputGroup.Text className="bg-transparent border-0 ps-3 text-secondary">
                    <small>Buscar</small>
                  </InputGroup.Text>
                  <Form.Control
                    className="bg-transparent border-0 shadow-none py-2"
                    placeholder="Filtrar por SKU, nombre o categoría..."
                    value={filtro}
                    onChange={handleFiltroChange}
                  />
                </InputGroup>
              </Col>
              <Col lg={2}>
                <div className="d-flex align-items-center gap-2">
                  <small className="text-muted text-uppercase fw-bold" style={{fontSize: '0.65rem'}}>Filas:</small>
                  <Form.Select size="sm" className="border-0 bg-light fw-bold" value={limite} onChange={handleLimiteChange} style={{ width: '75px' }}>
                    {[5, 10, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                  </Form.Select>
                </div>
              </Col>
              <Col lg={4} className="text-lg-end">
                <Stack direction="horizontal" gap={3} className="justify-content-lg-end">
                  <div className="text-end">
                    <div style={styles.cardTitle}>TOTAL PRODUCTOS</div>
                    <div className="fw-bold">{paginacionInfo.totalItems}</div>
                  </div>
                  <div className="vr text-muted opacity-25"></div>
                  <div className="text-end">
                    <div style={styles.cardTitle} className="text-danger">STOCK CRÍTICO</div>
                    <div className="fw-bold text-danger">{productos.filter(p => p.stock <= p.minStock).length}</div>
                  </div>
                </Stack>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* GRID DE DATOS */}
        <Card className="border-0 shadow-sm mb-4 overflow-hidden">
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead style={styles.tableHeader}>
                <tr>
                  <th className="ps-4 py-3 text-secondary border-0">DESCRIPCIÓN DEL PRODUCTO</th>
                  <th className="py-3 text-secondary border-0 text-center">CATEGORÍA</th>
                  <th className="py-3 text-secondary border-0 text-center">ESTADO</th>
                  <th className="py-3 text-secondary border-0">PRECIO UNIT.</th>
                  <th className="py-3 text-secondary border-0">NIVEL DE STOCK</th>
                  <th className="text-end pe-4 py-3 text-secondary border-0">OPERACIONES</th>
                </tr>
              </thead>
              <tbody style={{ opacity: loading ? 0.5 : 1, transition: "opacity 0.2s" }}>
                {productosFiltrados.map((p) => (
                  <tr key={p._id} className="border-bottom">
                    <td className="ps-4 py-3">
                      <div className="fw-bold text-dark mb-0">{p.name}</div>
                      <code className="text-secondary" style={styles.mono}>{p.sku}</code>
                    </td>
                    <td className="text-center">
                      <Badge pill bg="light" className="text-secondary border fw-normal px-3">{p.category}</Badge>
                    </td>
                    <td className="text-center">
                      <div className="d-flex align-items-center justify-content-center gap-2">
                        <div style={{width: '6px', height: '6px', borderRadius: '50%', backgroundColor: p.status === 'activo' ? '#10B981' : '#94A3B8'}}></div>
                        <span className="small text-muted text-uppercase fw-medium">
                          {p.status === 'activo' ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </td>
                    <td className="fw-bold text-dark" style={styles.mono}>
                      ${p.price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <span className={`fw-bold ${p.stock <= p.minStock ? "text-danger" : "text-dark"}`}>
                          {p.stock}
                        </span>
                        <div className="progress w-25" style={{ height: '4px' }}>
                          <div 
                            className={`progress-bar ${p.stock <= p.minStock ? "bg-danger" : "bg-dark"}`} 
                            style={{ width: `${Math.min((p.stock/p.minStock)*50, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-muted small" style={styles.mono}>/ {p.minStock}</span>
                      </div>
                    </td>
                    <td className="text-end pe-4">
                      <Stack direction="horizontal" gap={1} className="justify-content-end">
                        <Button variant="link" className="text-secondary p-2 text-decoration-none" onClick={() => handleEditarProducto(p)}>Editar</Button>
                        <Button variant="link" className="text-primary p-2 text-decoration-none" onClick={() => handleVerMovimientos(p)}>Manjeo</Button>
                        <Button variant="link" className="text-danger p-2 text-decoration-none opacity-50" onClick={() => handleEliminar(p._id)}>Borrar</Button>
                      </Stack>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          
          <Card.Footer className="bg-white border-top-0 py-4 px-4 d-flex justify-content-between align-items-center">
            <small className="text-secondary">
              Mostrando <span className="fw-bold">{productosFiltrados.length}</span> de {paginacionInfo.totalItems} registros
            </small>
            <Pagination size="sm" className="mb-0 shadow-sm border-0">
              <Pagination.Prev onClick={() => cambiarPagina(paginaActual - 1)} disabled={paginaActual === 1} />
              <Pagination.Item active className="px-3 border-0">{paginaActual}</Pagination.Item>
              <Pagination.Next onClick={() => cambiarPagina(paginaActual + 1)} disabled={paginaActual === paginacionInfo.totalPages} />
            </Pagination>
          </Card.Footer>
        </Card>
      </Container>

      {/* MODAL: EDICIÓN DE PRODUCTO */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0 px-4 pt-4">
          <Modal.Title className="fw-bold h5">{modoEdicion ? "Actualizar SKU" : "Registrar nuevo activo"}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form>
            <Row className="g-4">
              <Col md={8}><Form.Label style={styles.cardTitle}>NOMBRE DEL PRODUCTO</Form.Label><Form.Control className="bg-light border-0 py-2" value={nuevoProducto.name} onChange={(e) => setNuevoProducto({...nuevoProducto, name: e.target.value})} /></Col>
              <Col md={4}><Form.Label style={styles.cardTitle}>SERIAL / SKU</Form.Label><Form.Control className="bg-light border-0 py-2" style={styles.mono} value={nuevoProducto.sku} onChange={(e) => setNuevoProducto({...nuevoProducto, sku: e.target.value})} /></Col>
              <Col md={6}><Form.Label style={styles.cardTitle}>CATEGORÍA</Form.Label><Form.Control className="bg-light border-0 py-2" value={nuevoProducto.category} onChange={(e) => setNuevoProducto({...nuevoProducto, category: e.target.value})} /></Col>
              <Col md={6}><Form.Label style={styles.cardTitle}>ESTADO OPERATIVO</Form.Label>
                <Form.Select className="bg-light border-0 py-2 fw-medium" value={nuevoProducto.status} onChange={(e) => setNuevoProducto({...nuevoProducto, status: e.target.value})}>
                  <option value="activo">Activo</option>
                  <option value="inactivo">Archivado / Inactivo</option>
                </Form.Select>
              </Col>
              <Col md={4}><Form.Label style={styles.cardTitle}>PRECIO</Form.Label><Form.Control className="bg-light border-0 py-2" type="number" value={nuevoProducto.price} onChange={(e) => setNuevoProducto({...nuevoProducto, price: Number(e.target.value)})} /></Col>
              <Col md={4}><Form.Label style={styles.cardTitle}>STOCK DISPONIBLE</Form.Label><Form.Control className="bg-light border-0 py-2" type="number" value={nuevoProducto.stock} onChange={(e) => setNuevoProducto({...nuevoProducto, stock: Number(e.target.value)})} disabled={modoEdicion} /></Col>
              <Col md={4}><Form.Label style={styles.cardTitle} className="text-danger">UMBRAL MÍNIMO</Form.Label><Form.Control className="bg-light border-0 py-2 border-start border-danger border-3" type="number" value={nuevoProducto.minStock} onChange={(e) => setNuevoProducto({...nuevoProducto, minStock: Number(e.target.value)})} /></Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 px-4 pb-4">
          <Button variant="link" className="text-secondary text-decoration-none" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button style={styles.primaryAction} className="px-5 shadow-sm text-white" onClick={handleGuardarProducto}>Procesar Cambios</Button>
        </Modal.Footer>
      </Modal>

      {/* MODAL: HISTORIAL DE MOVIMIENTOS */}
      <Modal show={showMovimientosModal} onHide={() => setShowMovimientosModal(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0 p-4 pb-2">
          <Modal.Title className="fw-bold h5">Historial de Kardex: <span className="text-muted fw-normal">{productoSeleccionado?.name}</span></Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 pt-0">
          <div className="bg-light p-4 rounded-3 mb-4">
            <Row className="g-3 align-items-end">
              <Col md={3}><Form.Label style={styles.cardTitle}>TIPO</Form.Label>
                <Form.Select size="sm" className="border-0 shadow-sm" value={nuevoMovimiento.type} onChange={(e) => setNuevoMovimiento({...nuevoMovimiento, type: e.target.value})}>
                  <option value="entrada">Entrada (+)</option>
                  <option value="salida">Salida (-)</option>
                </Form.Select>
              </Col>
              <Col md={3}><Form.Label style={styles.cardTitle}>CANTIDAD</Form.Label><Form.Control size="sm" className="border-0 shadow-sm" type="number" value={nuevoMovimiento.quantity} onChange={(e) => setNuevoMovimiento({...nuevoMovimiento, quantity: Number(e.target.value)})} /></Col>
              <Col md={4}><Form.Label style={styles.cardTitle}>MOTIVO</Form.Label>
                <Form.Select size="sm" className="border-0 shadow-sm" value={nuevoMovimiento.reason} onChange={(e) => setNuevoMovimiento({...nuevoMovimiento, reason: e.target.value})}>
                  <option value="compra">Adquisición / Compra</option>
                  <option value="venta">Despacho / Venta</option>
                  <option value="ajuste">Ajuste de Auditoría</option>
                </Form.Select>
              </Col>
              <Col md={2}><Button variant="dark" size="sm" className="w-100 fw-bold border-0 py-2" onClick={handleGuardarMovimiento}>Registrar</Button></Col>
            </Row>
          </div>
          <div className="table-responsive rounded border overflow-hidden">
            <Table size="sm" hover className="mb-0">
              <thead style={styles.tableHeader}>
                <tr>
                  <th className="py-2 ps-3 border-0">FECHA/HORA</th>
                  <th className="py-2 border-0">TIPO</th>
                  <th className="py-2 border-0">CANT.</th>
                  <th className="py-2 border-0">MOTIVO</th>
                  <th className="py-2 pe-3 border-0 text-end">BALANCE FINAL</th>
                </tr>
              </thead>
              <tbody>
                {movimientos.map((m) => (
                  <tr key={m._id} className="small border-bottom">
                    <td className="ps-3 py-2 text-secondary">{new Date(m.createdAt).toLocaleDateString()}</td>
                    <td><Badge bg={m.type === 'entrada' ? 'success' : 'warning'} className="text-uppercase" style={{fontSize: '0.6rem'}}>{m.type === 'entrada' ? 'Ingreso' : 'Egreso'}</Badge></td>
                    <td className="fw-bold">{m.quantity}</td>
                    <td className="text-muted">{m.reason}</td>
                    <td className="fw-bold pe-3 text-end" style={styles.mono}>{m.currentStock}</td>
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
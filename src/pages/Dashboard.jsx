import { useEffect, useState } from "react";
import { Card, Row, Col, Table, Badge, Spinner, Pagination, Form, Container } from "react-bootstrap";
import api from "../Api/axios";

// Estilos inline para refinamientos que Bootstrap base no cubre
const styles = {
  mainBg: { backgroundColor: "#F8F9FA", minHeight: "100vh", paddingTop: "2rem" },
  headerTitle: { letterSpacing: "0.025em", color: "#212529" },
  cardTitle: { fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.05em", color: "#6C757D" },
  tableHeader: { backgroundColor: "#F1F3F5", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.05em" },
  mono: { fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace" }
};

export default function Dashboard() {
  const [asociados, setAsociados] = useState([]);
  const [stats, setStats] = useState({
    hoy: { total: 0, cantidad: 0 },
    mes: { total: 0, cantidad: 0 },
    anio: { total: 0, cantidad: 0 }
  });
  const [recentPayments, setRecentPayments] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, itemsPerPage: 10 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, [pagination.currentPage, pagination.itemsPerPage]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [resAsociados, resReporte] = await Promise.all([
        api.get("/asociados"),
        api.get(`/asociados/payment/reports/revenue?page=${pagination.currentPage}&limit=${pagination.itemsPerPage}`)
      ]);

      setAsociados(resAsociados.data);
      if (resReporte.data.ok) {
        setStats(resReporte.data.stats);
        setRecentPayments(resReporte.data.recentPayments);
        setPagination(prev => ({
          ...prev,
          totalPages: resReporte.data.pagination.totalPages,
          currentPage: resReporte.data.pagination.currentPage
        }));
      }
    } catch (error) {
      console.error("Error cargando dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  const activos = asociados.filter(a => a.status === "activo").length;
  const inactivos = asociados.filter(a => a.status === "inactivo").length;

  const cambiarPagina = (numero) => setPagination(prev => ({ ...prev, currentPage: numero }));
  const cambiarLimite = (e) => setPagination(prev => ({ ...prev, itemsPerPage: Number(e.target.value), currentPage: 1 }));

  const ControlesPaginacion = () => (
    <div className="d-flex align-items-center gap-3">
      <div className="d-flex align-items-center gap-2">
        <span className="text-secondary" style={{ fontSize: "0.8rem" }}>Filas:</span>
        <Form.Select 
          size="sm" 
          className="border-0 shadow-sm bg-white"
          value={pagination.itemsPerPage} 
          onChange={cambiarLimite}
          style={{ width: '70px', fontSize: "0.8rem" }}
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="50">50</option>
        </Form.Select>
      </div>
      
      <Pagination size="sm" className="mb-0 shadow-sm">
        <Pagination.Prev onClick={() => cambiarPagina(pagination.currentPage - 1)} disabled={pagination.currentPage === 1} />
        <Pagination.Item active className="px-2">{pagination.currentPage}</Pagination.Item>
        <Pagination.Next onClick={() => cambiarPagina(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.totalPages} />
      </Pagination>
    </div>
  );

  if (loading && asociados.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <Spinner animation="border" variant="secondary" size="sm" />
      </div>
    );
  }

  return (
    <div style={styles.mainBg}>
      <Container fluid className="px-lg-5">
        {/* Header Section */}
        <header className="mb-5">
          <h2 className="fw-bold mb-1" style={styles.headerTitle}>Metricas basicas</h2>
          <p className="text-secondary fw-light">Gestión operativa y flujo de recaudación en tiempo real.</p>
        </header>

        {/* Primary Stats Grid */}
        <Row className="mb-4">
          {[
            { label: "TOTAL ASOCIADOS", val: asociados.length, color: "text-dark" },
            { label: "SOCIOS ACTIVOS", val: activos, color: "text-dark" },
            { label: "SOCIOS INACTIVOS", val: inactivos, color: "text-secondary" },
            { label: "RECAUDACIÓN HOY", val: `$ ${stats.hoy.total.toLocaleString()}`, color: "text-primary" }
          ].map((item, idx) => (
            <Col md={3} key={idx}>
              <Card className="border-0 shadow-sm py-3 px-2">
                <Card.Body>
                  <h6 className="text-uppercase mb-3" style={styles.cardTitle}>{item.label}</h6>
                  <h3 className={`fw-bold mb-0 ${item.color}`} style={styles.headerTitle}>{item.val}</h3>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Secondary Insights */}
        <Row className="mb-5">
          <Col md={6}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-uppercase mb-2" style={styles.cardTitle}>Recaudación Mensual</h6>
                  <h2 className="fw-bold mb-0" style={styles.mono}>${stats.mes.total.toLocaleString()}</h2>
                </div>
                <Badge pill bg="light" className="text-secondary border px-3 py-2 fw-normal">
                  {stats.mes.cantidad} Transacciones
                </Badge>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-uppercase mb-2" style={styles.cardTitle}>Recaudación Anual</h6>
                  <h2 className="fw-bold mb-0" style={styles.mono}>${stats.anio.total.toLocaleString()}</h2>
                </div>
                <Badge pill bg="light" className="text-secondary border px-3 py-2 fw-normal">
                  {stats.anio.cantidad} Pagos Totales
                </Badge>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Data Grid Section */}
        <Row className="pb-5">
          <Col md={12}>
            <Card className="border-0 shadow-sm overflow-hidden">
              <Card.Header className="bg-white border-bottom py-4 px-4 d-flex justify-content-between align-items-center">
                <h6 className="mb-0 fw-bold text-uppercase" style={styles.cardTitle}>Últimos Pagos Registrados</h6>
                <ControlesPaginacion />
              </Card.Header>
              <Card.Body className="p-0">
                <Table hover responsive className="align-middle mb-0">
                  <thead style={styles.tableHeader}>
                    <tr>
                      <th className="px-4 py-3 text-secondary">SOCIO</th>
                      <th className="py-3 text-secondary">ID DOCUMENTO</th>
                      <th className="py-3 text-secondary">PERIODO</th>
                      <th className="py-3 text-secondary">MONTO</th>
                      <th className="py-3 text-secondary">FECHA</th>
                      <th className="py-3 text-secondary text-end px-4">OPERADOR</th>
                    </tr>
                  </thead>
                  <tbody style={{ opacity: loading ? 0.4 : 1, transition: "opacity 0.2s ease" }}>
                    {recentPayments.map((p) => (
                      <tr key={p.id}>
                        <td className="px-4 py-3 fw-medium">{p.asociado?.nombre || "—"}</td>
                        <td className="py-3 text-secondary" style={styles.mono}>{p.asociado?.documento || "—"}</td>
                        <td className="py-3 text-uppercase small fw-semibold text-muted">{p.periodo}</td>
                        <td className="py-3 fw-bold text-dark" style={styles.mono}>
                          ${p.monto.toLocaleString()}
                        </td>
                        <td className="py-3 text-secondary small">
                          {new Date(p.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="py-3 text-end px-4">
                          <Badge pill bg="light" className="text-secondary border-0 fw-medium px-3">
                            {p.registradoPor}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
              <Card.Footer className="bg-white border-0 py-4 d-flex justify-content-center">
                <ControlesPaginacion />
              </Card.Footer>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
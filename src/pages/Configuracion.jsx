import { useState } from "react";
import { Card, Form, Button, Row, Col } from "react-bootstrap";

export default function Configuracion() {
  const [config, setConfig] = useState({
    nombreSistema: "Sistema de Gestión",
    email: "contacto@email.com",
    telefono: "",
    moneda: "ARS",
    estadoAsociadoDefault: "activo",
    montoMensual: 0,
    diaVencimiento: 10,
  });

  const handleChange = (e) => {
    setConfig({
      ...config,
      [e.target.name]: e.target.value,
    });
  };

  const handleGuardar = () => {
    console.log("Configuración guardada:", config);
    alert("Configuración guardada correctamente");
    // después lo conectamos al backend
  };

  return (
    <div className="container-fluid">
      <h2 className="mb-4">Configuración</h2>

      <Row>
        {/* DATOS DEL SISTEMA */}
        <Col md={6}>
          <Card className="mb-4 shadow-sm">
            <Card.Header>Datos del Sistema</Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  name="nombreSistema"
                  value={config.nombreSistema}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  name="email"
                  type="email"
                  value={config.email}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Teléfono</Form.Label>
                <Form.Control
                  name="telefono"
                  value={config.telefono}
                  onChange={handleChange}
                />
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>

        {/* PREFERENCIAS */}
        <Col md={6}>
          <Card className="mb-4 shadow-sm">
            <Card.Header>Preferencias</Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Moneda</Form.Label>
                <Form.Select
                  name="moneda"
                  value={config.moneda}
                  onChange={handleChange}
                >
                  <option value="ARS">$ Pesos</option>
                  <option value="USD">USD</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Estado por defecto del asociado</Form.Label>
                <Form.Select
                  name="estadoAsociadoDefault"
                  value={config.estadoAsociadoDefault}
                  onChange={handleChange}
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </Form.Select>
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* PAGOS */}
      <Row>
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Header>Pagos</Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Monto mensual por defecto</Form.Label>
                <Form.Control
                  type="number"
                  name="montoMensual"
                  value={config.montoMensual}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Día de vencimiento</Form.Label>
                <Form.Control
                  type="number"
                  name="diaVencimiento"
                  value={config.diaVencimiento}
                  onChange={handleChange}
                />
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <div className="mt-4">
        <Button variant="dark" onClick={handleGuardar}>
          Guardar configuración
        </Button>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import api from "../Api/axios";

// Design System Tokens
const STYLES = {
  wrapper: {
    backgroundColor: "#F8F9FA",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
  },
  card: {
    border: "none",
    borderRadius: "12px",
    padding: "2.5rem",
  },
  label: {
    fontSize: "0.7rem",
    fontWeight: 700,
    letterSpacing: "0.05em",
    color: "#64748B",
    marginBottom: "0.5rem",
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: "#F1F5F9",
    border: "1px solid #E2E8F0",
    padding: "0.75rem 1rem",
    fontSize: "0.95rem",
    borderRadius: "8px",
    color: "#1E293B",
  },
  button: {
    backgroundColor: "#0F172A", // Navy Slate
    border: "none",
    padding: "0.8rem",
    fontWeight: 600,
    fontSize: "0.9rem",
    borderRadius: "8px",
    marginTop: "1rem",
    transition: "all 0.2s ease",
  },
  title: {
    color: "#0F172A",
    fontWeight: 800,
    letterSpacing: "-0.02em",
  }
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (err) {
      setError("Las credenciales introducidas no coinciden con nuestros registros.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={STYLES.wrapper}>
      <Container>
        <Row className="justify-content-center">
          <Col md={5} lg={4}>
            {/* LOGOTIPO O IDENTIDAD VISUAL OPCIONAL AQUÍ */}
            <div className="text-center mb-4">
          
              <p className="text-secondary small">Sistema de Gestión koryzen V0.1</p>
            </div>

            <Card style={STYLES.card} className="shadow-sm">
              <Card.Body className="p-0">
                {error && (
                  <Alert variant="danger" className="py-2 border-0 small text-center mb-4" style={{ backgroundColor: '#FEF2F2', color: '#991B1B' }}>
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label style={STYLES.label}>Correo Electrónico</Form.Label>
                    <Form.Control
                      type="email"
                      style={STYLES.input}
                      className="shadow-none"
                      placeholder="nombre@empresa.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <div className="d-flex justify-content-between">
                      <Form.Label style={STYLES.label}>Contraseña</Form.Label>
                     {/* 
                     <a href="#" className="text-decoration-none small text-muted" style={{ fontSize: '0.65rem' }}>Recuperar</a>
                     */}
                    </div>
                    <Form.Control
                      type="password"
                      style={STYLES.input}
                      className="shadow-none"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Button 
                    type="submit" 
                    style={STYLES.button} 
                    className="w-100 shadow-sm"
                    disabled={loading}
                  >
                    {loading ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      "Iniciar Sesión"
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
            
            <footer className="text-center mt-5">
              <p className="text-muted" style={{ fontSize: '0.75rem' }}>
                &copy; 2026 koryzen Enterprise Solutions. Todos los derechos reservados.
              </p>
            </footer>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
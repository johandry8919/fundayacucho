// components/BecarioRouteHandler.jsx
import { useAuth } from "../context/AuthContext";
import BecarioView from "./BecarioView";
import SearchForm from "./SearchForm";

function BecarioRouteHandler() {
  const { user } = useAuth();

  if (!user) {
    return null; // O un spinner de carga
  }

  return user.tipo_usuario === '1' ? <BecarioView /> : <SearchForm />;
}

export default BecarioRouteHandler;

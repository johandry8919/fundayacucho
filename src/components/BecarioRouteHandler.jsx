// components/BecarioRouteHandler.jsx
import { useAuth } from "../context/AuthContext";
import BecarioEsteriol from "./BecarioEsteriol";
import BecarioView from "./BecarioView";
import SearchForm from "./SearchForm";

function BecarioRouteHandler() {
  const { user } = useAuth();
  let viewbecarios = null
  if (!user) {
    return null; // O un spinner de carga
  }
  if(user.tipo_usuario === '1'){
    viewbecarios = <BecarioView />
  }else if(user.tipo_usuario === '2'){
    viewbecarios =  <SearchForm />
  }else if(user.tipo_usuario === '3'){
    viewbecarios =  <BecarioEsteriol />
  }
  return viewbecarios
}

export default BecarioRouteHandler;

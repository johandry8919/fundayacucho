import * as React from "react";
import {
  get_becarios,
} from "../../services/api";
import StatisticsPanel from "../../components/StatisticsPanel";


export default function Dashboard() {
  const [becarios, setBecarios] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
   const [error, setError] = React.useState(null);


  React.useEffect(() => {
      const cargarDatosIniciales = async () => {
        try {
          setLoading(true);
          const response = await get_becarios();
          if (response.success) {
            setBecarios(response.data || []);
            setError(null);
          } else {
            throw new Error(response.message || "Error al cargar becarios");
          }
        } catch (err) {
          console.error("Error al cargar becarios:", err);
          setError(err.message || error);
          setBecarios([]);
        } finally {
          setLoading(false);
        }
      };

      cargarDatosIniciales();
  
 
    }, []);

  return(
    <div className="mt-4"> <StatisticsPanel becarios={becarios} loading={loading}/> </div>
  )
 
}
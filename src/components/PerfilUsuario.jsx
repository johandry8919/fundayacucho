// perfil de usuario 
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FiLogOut } from 'react-icons/fi';

function PerfilUsuario() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleLogout = () => {
        // Aquí puedes agregar la lógica de logout, como limpiar el token de autenticación.
        Swal.fire({
            title: '¿Estás seguro?',
            text: "Se cerrará tu sesión actual.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, cerrar sesión',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                navigate('/login');
            }
        });
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center font-sans p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 transform transition-all hover:scale-105 duration-300">
                <div className="flex flex-col items-center">
                    {/* Profile Picture */}
                    <div className="relative mb-6">
                        <img 
                            className="w-28 h-28 rounded-full object-cover border-4 border-primary-light shadow-md"
                            src="https://cdn-icons-png.flaticon.com/512/149/149071.png" 
                            alt="Foto de perfil" 
                        />
                    </div>

                    {/* User Info */}
                    <h1 className="text-2xl font-bold font-heading text-gray-800 mb-1">{user?.nombresApellidos || 'Nombre de Usuario'}</h1>
                    <p className="text-sm text-gray-500 mb-6">{user?.tipoUsuario || 'Tipo de Usuario'}</p>

                    <div className="w-full text-left space-y-3">
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm font-semibold text-gray-600">Cédula</p>
                            <p className="text-md text-gray-800">{user?.cedula || 'No disponible'}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm font-semibold text-gray-600">Nacionalidad</p>
                            <p className="text-md text-gray-800">{user?.nacionalidad || 'No disponible'}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm font-semibold text-gray-600">Correo Electrónico</p>
                            <p className="text-md text-gray-800">{user?.email || 'No disponible'}</p>
                        </div>
                    </div>

                    {/* Logout Button */}
                    <button 
                        onClick={handleLogout}
                        className="mt-8 w-full flex items-center justify-center gap-2 bg-accent text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-red-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                    >
                        <FiLogOut />
                        Cerrar sesión
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PerfilUsuario;

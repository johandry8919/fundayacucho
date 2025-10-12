import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { recuperar_clave } from '../services/api';
import styles from './Recupera_clave.module.css';

const Recupera_clave = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
    });
    const [loading, setLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(true);
    const [error, setError] = useState('');
    
    useEffect(() => {
        return () => {
            setIsMounted(false);
        };
    }, []);
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        if (error) setError('');
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const response = await recuperar_clave(formData.email);
            if (response.message === 'Recuperar clave exitoso') {
                navigate('/login', { 
                    state: { 
                        success: 'Se ha enviado un enlace de recuperación a tu correo electrónico.' 
                    },
                    replace: true 
                });
            } else {
                setError(response.message || 'Error al procesar la solicitud');
            }
        } catch (err) {
            console.error('Recuperar clave error:', err);
            if (isMounted) {
                setError('Error de conexión o del servidor. Por favor intente nuevamente.');
            }
        } finally {
            if (isMounted) {
                setLoading(false);
            }
        }
    };

    const handleCancel = () => {
        navigate('/login');
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Recuperar Contraseña</h1>
                
                {error && <p className={styles.error}>{error}</p>}
                {loading && <p className={styles.loading}>Procesando...</p>}
                
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="email" className={styles.label}>
                            Correo Electrónico
                        </label>
                        <input
                            className={styles.input}
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Ingresa tu correo electrónico"
                            required
                            disabled={loading}
                        />
                    </div>
                    
                    <div className={styles.buttonGroup}>
                        <button 
                            type="button" 
                            onClick={handleCancel}
                            className={`${styles.button} ${styles.secondaryButton}`}
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className={`${styles.button} ${styles.primaryButton}`}
                            disabled={loading}
                        >
                            {loading ? 'Enviando...' : 'Enviar Enlace'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Recupera_clave;

    
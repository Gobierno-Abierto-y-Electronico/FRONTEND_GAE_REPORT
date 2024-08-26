import React, { useState, useEffect } from 'react';
import { Input } from "../Input.jsx";
import { useNavigate } from "react-router-dom";
import { useFetchPersonal } from '../../shared/hooks/index.js';
import { useUserDetails } from "../../shared/hooks/useUserDetails";
import { useUpdateUser } from "../../shared/hooks/useUpdateUser";
import { useUpdateUnity } from "../../shared/hooks/useUpdateUnity";
import { useFetchUnity } from '../../shared/hooks/useFetchUnity.jsx';
import { useStoreReporte } from '../../shared/hooks/useStoreReporte.jsx';
import { useGenerarExcel } from '../../shared/hooks/useGenerarExcel.jsx';
import { useGetReport } from '../../shared/hooks/useGetReport.jsx';
import './personal.css';
import toast from 'react-hot-toast';

export const Personal = () => {
  const { generateExcelForSelected, isGenerating } = useGenerarExcel();
  const { personales, isLoading: isLoadingPersonal, error } = useFetchPersonal();
  const today = new Date();
  const now = new Date();

  const currentTime = now.toTimeString().split(' ')[0].slice(0, 5);
  const [message, setMessage] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [selectedPersonal, setSelectedPersonal] = useState({});
  const [pepaPig, setPepaPig] = useState([]);
  const { id, userDetails, setReport } = useUserDetails();
  const { updatedUser, actualizarReporte } = useUpdateUser();
  const { actualizarUnidad, response } = useUpdateUnity();
  const { storeReporteData } = useStoreReporte();
  const { reportResponse } = useGetReport();
  const { report } = useGenerarExcel();
  const { assistance } = useFetchUnity(userDetails.unidadId);

  // Verificar si el usuario tiene el correo requerido
  const isUserAllowedToGenerateExcel = userDetails.email === 'jaime@gmail.com';

  const handleEnviarReporte = async () => {
    if (!assistance.unity.report) {
      const allPersonalList = personales.personales.map((personal) => {
        return {
          ...personal,
          selected: selectedPersonal[personal._id] || false,
        };
      });

      assistance.unity.report = true;

      try {
        await storeReporteData(allPersonalList);
        console.log(allPersonalList, "pepapig");
        await actualizarUnidad(assistance.unity._id, assistance.unity);
        toast.success('Informe enviado');
      } catch (error) {
        console.error('Error al actualizar el reporte en la base de datos:', error);
        toast.error('Error al enviar el informe');
      }
    } else {
      console.log(assistance.unity.report, "ya enviado");
      toast.error('Ya se envió el informe de asistencia de hoy');
      console.log(allPersonalList.length);
    }
  };

  const handleGenerateExcel = async () => {
    try {
      if (reportResponse.data.reportes.length > 0) {
        toast.success('Excel generado');
        generateExcelForSelected(reportResponse.data.reportes);
      } else {
        toast.error('No hay informes enviados');
      }
    } catch (e) {
      toast.error('Hubo un problema al generar el Excel');
    }
  };

  const formattedDate = today.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const [formState, setFormState] = useState({
    fecha: {
      value: "",
      isValid: false,
      showError: false,
    },
    hora: {
      value: "",
      isValid: false,
      showError: false,
    },
  });

  useEffect(() => {
    if (personales && personales.personales) {
      const allChecked = personales.personales.reduce((acc, personal) => {
        acc[personal._id] = selectAll;
        return acc;
      }, {});
      setSelectedPersonal(allChecked);
    }
  }, [selectAll, personales]);

  const handleInputValueChange = (value, field) => {
    setFormState((prevState) => ({
      ...prevState,
      [field]: {
        ...prevState[field],
        value,
      },
    }));
  };

  const handleInputValidationOnBlur = (value, field) => {
    let isValid = value.trim() !== "";
    setFormState((prevState) => ({
      ...prevState,
      [field]: {
        ...prevState[field],
        isValid,
        showError: !isValid
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      fecha: formState.fecha.value,
      hora: formState.hora.value,
    };

    const result = await createPost(data);
    if (result.error) {
      setMessage('Error al agregar el empleado');
    } else {
      await refetch();
      setMessage('Empleado agregado exitosamente');
    }
  };

  const isSubmitButtonDisabled = !formState.fecha.isValid || !formState.hora.isValid;

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
  };

  const handleCheckboxChange = (e, id) => {
    setSelectedPersonal((prevSelected) => ({
      ...prevSelected,
      [id]: e.target.checked,
    }));
  };

  return (
    <div className='body-containerP'>
      <div className="two-titles">
        <div className='titlePost'>
          <h1>Control de Personal</h1>
          <hr />
        </div>
        <div className='selectAll'>
          <h2>Marcar a todos</h2>
          <div className="checkbox-wrapper-5">
            <div className="check">
              <input
                id="check-5"
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
              />
              <label htmlFor="check-5"></label>
            </div>
          </div>
        </div>
      </div>
      <div className='personal-containerr'>
        <div className='first-container'>
          <Input
            field='fecha'
            label='Fecha'
            value={formattedDate}
            onChangeHandler={handleInputValueChange}
            type='text'
            disabled={true}
            onBlurHandler={handleInputValidationOnBlur}
          />
          <Input
            field='hora'
            label='Hora'
            value={currentTime}
            onChangeHandler={handleInputValueChange}
            type='text'
            disabled={true}
            onBlurHandler={handleInputValidationOnBlur}
          />
          <div className='botones-excel'>
            <button className="pushable" onClick={handleEnviarReporte} disabled={isGenerating || report}>
              <span className="shadow"></span>
              <span className="edge"></span>
              <span className="front">Enviar</span>
            </button>
            {isUserAllowedToGenerateExcel && (
              <button className="pushable" onClick={handleGenerateExcel} disabled={isGenerating || report}>
                <span className="shadow"></span>
                <span className="edge"></span>
                <span className="front">Generar Excel</span>
              </button>
            )}
          </div>
          {message && <p>{message}</p>}
        </div>
        <div className='posts-personal'>
          {isLoadingPersonal ? (
            <p>Cargando empleados...</p>
          ) : error ? (
            <p>Error al cargar empleados: {error.message}</p>
          ) : (
            personales.personales.length > 0 ? (
              personales.personales.map((personal) => (
                <div className='checkbox-wrapper-16' key={personal._id}>
                  <label className="checkbox-wrapper">
                    <input
                      type="checkbox"
                      className="checkbox-input"
                      checked={selectedPersonal[personal._id] || false}
                      onChange={(e) => handleCheckboxChange(e, personal._id)}
                    />
                    <span className="checkbox-tile">
                      <h3>{`${personal.name} ${personal.lastName}`}</h3>
                      <p>{personal.number}</p>
                    </span>
                  </label>
                </div>
              ))
            ) : (
              <p>No hay empleados disponibles.</p>
            )
          )}
        </div>
      </div>
    </div>
  );
};

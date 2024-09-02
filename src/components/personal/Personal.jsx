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
import { DropdownButton } from '.././dropdown/Dropdown.jsx';
import './personal.css';
import toast from 'react-hot-toast';

const handleReasonSelect = (reason, id) => {
  if (reason === 'Otro') {
    setCurrentPersonalId(id);
    setShowCustomReasonInput(true);
  } else {
    setSelectedReason((prevSelected) => ({
      ...prevSelected,
      [id]: reason,
    }));
  }
};

const handleCustomReasonChange = (e) => {
  setCustomReason(e.target.value);
};

const handleSaveCustomReason = () => {
  if (customReason.trim() !== '' && currentPersonalId !== null) {
    setSelectedReason((prevSelected) => ({
      ...prevSelected,
      [currentPersonalId]: customReason,
    }));
    setCustomReason('');
    setCurrentPersonalId(null);
    setShowCustomReasonInput(false);
  }
};

export const Personal = () => {
  const [selectedPersonal, setSelectedPersonal] = useState({});
  const [selectedReason, setSelectedReason] = useState({});
  const [showCustomReasonInput, setShowCustomReasonInput] = useState(false);
  const [message, setMessage] = useState('');
  const [fechaDelReporte, setFechaDelReporte] = useState('');
  const [todayDate, setTodayDate] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [customReason] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [selectedPublication, setSelectedPublication] = useState(null);

  const { generateExcelForSelected, isGenerating } = useGenerarExcel();
  const { personales, isLoading: isLoadingPersonal, error } = useFetchPersonal();
  const today = new Date();
  const now = new Date();
  const currentTime = now.toTimeString().split(' ')[0].slice(0, 5);
  const { userDetails, setReport } = useUserDetails();
  const { actualizarUnidad, response } = useUpdateUnity();
  const { storeReporteData } = useStoreReporte();
  const { reportResponse, fechaReport } = useGetReport();
  const { report } = useGenerarExcel();
  const { assistance } = useFetchUnity(userDetails.unidadId);

  console.log(fechaReport, "fecha reporte 1");

  const isUserAllowedToGenerateExcel = userDetails.email === 'jaime@gmail.com';



  useEffect(() => {
    if (reportResponse && fechaReport) {
      const date = new Date(fechaReport);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      setFechaDelReporte(`${year}-${month}-${day}`);
    }

    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
    const todayDay = String(today.getDate()).padStart(2, '0');
    setTodayDate(`${todayYear}-${todayMonth}-${todayDay}`);
  }, [fechaReport, reportResponse]);

  const handleCustomReasonChange = (e) => {
    setCustomReason(e.target.value);
  };

  const handleReasonSelect = (reason, id) => {
    if (reason === 'Otro') {
      setCurrentPersonalId(id);
      setShowCustomReasonInput(true);
    } else {
      setSelectedReason((prevSelected) => ({
        ...prevSelected,
        [id]: reason,
      }));
    }
  };
  const handleSaveCustomReason = () => {
    if (customReason.trim() !== '' && currentPersonalId !== null) {
      setSelectedReason((prevSelected) => ({
        ...prevSelected,
        [currentPersonalId]: customReason,
      }));
      setCustomReason('');
      setCurrentPersonalId(null);
      setShowCustomReasonInput(false);
    }
  };
  const handleEnviarReporte = async () => {
    console.log(reportResponse, "reporte");
    console.log(fechaDelReporte, "--------------------------------------------", todayDate);

    // Compare dates
    if (todayDate !== fechaDelReporte) {
      const allPersonalList = personales.personales.map((personal) => {
        return {
          ...personal,
          selected: selectedPersonal[personal._id] || false,
          reason: selectedReason[personal._id] || "Asistió",
        };
      });

      assistance.unity.report = false;
      assistance.unity.dateOfReportByUnity = todayDate;

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
      console.log(e);
    }
  };

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

  const handleDocumentClick = (e) => {
    if (!e.target.closest('.dropdown')) {
      setDropdownOpen(false);
    }
  };
  const handleCommentClick = (publication) => {
    setSelectedPublication(publication);
    setShowComments(true);
  };

  const handleCloseComments = () => {
    setShowComments(false);
    setSelectedPublication(null);
  };
  useEffect(() => {
    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);

  return (
    <div className='personal'>
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
        {/* Include DropdownButton here */}
      </div>
      <div className='personal-containerr'>
        <div className='first-container'>
          <Input
            field='fecha'
            label='Fecha'
            value={fechaDelReporte}
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
                      <div className="checkbox-container">
                        <div className="checkbox-info">
                          <h3>{`${personal.name} ${personal.lastName}`}</h3>
                          <p>{personal.number}</p>
                        </div>
                        <div className="checkbox-dropdown">
                          <DropdownButton 
                            onSelect={(reason) => handleReasonSelect(reason, personal._id)}
                          />                      
                        </div>
                      </div>
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
      {showCustomReasonInput && (
        <div className="custom-reason-container">
          <input
            type="text"
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            placeholder="Escribe la razón"
          />
          <button onClick={handleSaveCustomReason}>Guardar</button>
        </div>
      )}
      {showComments && selectedPublication && (
        <Comments 
          publiUnica={selectedPublication}
          onClose={handleCloseComments}
        />
      )}
    </div>
  );
};
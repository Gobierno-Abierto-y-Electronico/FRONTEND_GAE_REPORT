import React, { useState, useEffect } from 'react';
import { Input } from "../Input.jsx";
import { useNavigate } from "react-router-dom";
import { useFetchPersonal, useGenerarExcel } from '../../shared/hooks/index.js';
import { useUserDetails } from "../../shared/hooks/useUserDetails";
import { useUpdateUser } from "../../shared/hooks/useUpdateUser";
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
  const { report, id, userDetails, setReport } = useUserDetails();
  const { updatedUser, actualizarReporte } = useUpdateUser();


  const handleGenerateExcel = () => {
    if (userDetails.report) {
      const allPersonalList = personales.personales.map((personal) => {
        return {
          ...personal,
          selected: selectedPersonal[personal._id] || false,
        };
      });
  
      setPepaPig((prevPepaPig) => prevPepaPig.concat(allPersonalList));
  
      if (pepaPig.length > 0) {
        console.log(pepaPig.length);
        // generateExcelForSelected(pepaPig);
      }

      userDetails.report = false;
      actualizarReporte(id, userDetails);
    } else {
      console.log(userDetails.report)
      toast.error('Ya se envió el informe de asistencia de hoy');
      console.log(pepaPig.length);
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
          <h2>Todos Presentes</h2>
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
          <button className="pushable" onClick={handleGenerateExcel} disabled={isGenerating || report}>
            <span className="shadow"></span>
            <span className="edge"></span>
            <span className="front">Enviar</span>
          </button>
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

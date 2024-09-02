import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import "./razon.css";
import { useCommentPost } from "../../shared/hooks/useCommentPost";
import { useComments } from "../../shared/hooks/useComments";

export const Comments = ({ publiUnica, onClose }) => {
    const [desc, setDesc] = useState("");
    const [autor, setAutor] = useState("");
    const { commentPost } = useCommentPost();
    const { comments, getComments } = useComments(publiUnica.publication._id);

    useEffect(() => {
        getComments(publiUnica.publication._id);
    }, [publiUnica.publication._id]);

    const handleSubmit = async () => {
        if (!autor || !desc) {
            toast.error("Por favor, rellena todos los campos");
            return;
        }
        const date = new Date().toISOString();
        await commentPost(publiUnica.publication._id, autor, date, desc);
        getComments(publiUnica.publication._id);
        setDesc("");
        setAutor("");
        toast.success("Comentario agregado");
    };

    return (
        <div className='comments-container'>
            <button className="close-button" onClick={onClose}>X</button>
            <div className='comments-header'>
                <h4 className='comments-title'>Comentarios</h4>
            </div>
            <div className='comments-body'>
                <div className='write'>
                    <div className="input-group">
                        <input required="true" type="text" value={autor} className="input" onChange={(e) => setAutor(e.target.value)} />
                        <label className="user-label">Nombre Completo</label>
                    </div>
                    <div className="input-group">
                        <textarea required="true" type="text" value={desc} className="input" onChange={(e) => setDesc(e.target.value)} />
                        <label className="user-label">Escribe un comentario</label>
                    </div>
                </div>
                <div className='espacio'>
                    <button className='button' onClick={handleSubmit}>
                        <span>Comentar</span>
                    </button>
                </div>
                <div className='comments-list'>
                    {comments.slice().reverse().map((item) => (
                        <div className='comment' key={item._id}>
                            <div className='info_comment'>
                                <p className='autorName'>{item.autorName}</p>
                                <p className='date'>{new Date(item.date).toLocaleString()}</p>
                            </div>
                            <p className='desc'>{item.commentText}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

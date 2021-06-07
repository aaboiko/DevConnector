import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { addPost } from '../../actions/post';

const PostForm = ({ addPost }) => {
    const [text, setText] = useState('');
    const { register, handleSubmit } = useForm('');

    return (
        <div className='post-form'>
            <div className='bg-primary p'>
                <h3>Here you can create a new post</h3>
            </div>
            <form
                className='form my-1'
                onSubmit={e => {
                    e.preventDefault();
                    addPost({ text })
                    setText('');
                }}
            >
                <textarea 
                    name='text'
                    cols='30'
                    rows='5'
                    placeholder='Create a post'
                    value={text}
                    onChange={e => setText(e.target.value)}
                    
                />
                <input type='submit' className='btn btn-dark my-1' value='Publish' />
            </form>
        </div>
    );
};

PostForm.propTypes = {
    addPost: PropTypes.func.isRequired
};

export default connect(null, { addPost })(PostForm);
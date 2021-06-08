import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { addPost, postEmpty } from '../../actions/post';

const PostForm = ({ addPost, postEmpty }) => {
    const [text, setText] = useState('');

    return (
        <div className='post-form'>
            <div className='bg-primary p'>
                <h3>Here you can create a new post</h3>
            </div>
            <form
                className='form my-1'
                onSubmit={e => {
                    e.preventDefault();
                    if(text.trim().length > 0){
                        addPost({ text })
                    }
                    else{
                        postEmpty();
                    }
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

export default connect(null, { addPost, postEmpty })(PostForm);
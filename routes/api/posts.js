const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const auth = require('../../middleware/auth');

const Post = require('../../models/Post');
const { findById } = require('../../models/Profile');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

//Creating a post
router.post('/', [auth, [
        check('text', 'Text is required').not().isEmpty()
    ]],
    async(req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const user = await User.findById(req.user.id).select('-password');
            const newPost = new Post({
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id
            });
            const post = await newPost.save();
            res.json(post);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }

    });

//Getting all posts
router.get('/', auth, async(req, res) => {
    try {
        const posts = await Post.find().sort({ date: -1 });
        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

//Getting post by id
router.get('/:id', auth, async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }
        res.json(post);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' });
        }
        res.status(500).send('Server error');
    }
});

//Deleting a post
router.delete('/:id', auth, async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await post.remove();
        res.json({ msg: 'Post removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' });
        }
        res.status(500).send('Server error');
    }
});

//Updating a post
router.put('/:id', auth, async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        const user = await User.findById(req.user.id).select('-password');
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        const updatedPost = {
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id,
            likes: post.likes,
            comments: post.comments,
            date: post.date
        };
        //Maybe it is not a good-looking construction, but it works
        post.text = updatedPost.text;
        post.name = updatedPost.name;
        post.avatar = updatedPost.avatar;
        post.user = updatedPost.user;
        post.likes = updatedPost.likes;
        post.comments = updatedPost.comments;
        post.date = updatedPost.date;

        await post.save();
        res.json(post);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' });
        }
        res.status(500).send('Server error');
    }
});

//Like a post
router.put('/like/:id', auth, async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        //Checking if the post has already been liked by this user
        if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            post.likes.unshift({ user: req.user.id });
        }

        await post.save();
        res.json(post.likes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

//Unlike a post
router.put('/unlike/:id', auth, async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        //Checking if the post has not been liked by this user
        if (post.likes.filter(like => like.user.toString() === req.user.id).length !== 0) {
            const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);
            post.likes.splice(removeIndex, 1);
        }

        await post.save();
        res.json(post.likes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

//New comment on a post
router.post('/comment/:id', [auth, [
        check('text', 'Text is required').not().isEmpty()
    ]],
    async(req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const user = await User.findById(req.user.id).select('-password');
            const post = await Post.findById(req.params.id);

            const newComment = {
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id
            };

            post.comments.unshift(newComment);
            await post.save();
            res.json(post.comments);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }

    });

//Delete comment 
router.delete('/comment/:id/:comment_id', auth, async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        const comment = post.comments.find(comment => comment.id === req.params.comment_id);

        if (!comment) {
            return res.status(404).json({ msg: 'Comment not found' });
        }
        if (comment.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User is not authorized' });
        }

        const removeIndex = post.comments.map(comment => comment.user
                .toString())
            .indexOf(req.user.id);
        post.comments.splice(removeIndex, 1);
        await post.save();
        res.json(post.comments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
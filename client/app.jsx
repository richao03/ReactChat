var React = require('react');

var socket = io.connect();
var isTyping = false;


var UsersList = React.createClass({
	displayName: 'UsersList',

	render: function render() {
		return React.createElement(
			'div',
			{ className: 'users' },
			React.createElement(
				'h3',
				null,
				' Users Online '
			),
			React.createElement(
				'ul',
				null,
				this.props.users.map(function (user, i) {
					return React.createElement(
						'li',
						{ key: i },
						user
					);
				})
			)
		);
	}
});

var Message = React.createClass({
	displayName: 'Message',

	render: function render() {
		return React.createElement(
			'div',
			{ className: 'message' },
			React.createElement(
				'strong',
				null,
				this.props.user,
				' :'
			),
			React.createElement(
				'span',
				null,
				this.props.text
			)
		);
	}
});

var MessageList = React.createClass({
	displayName: 'MessageList',

	render: function render() {
		return React.createElement(
			'div',
			{ id: 'messages', className: 'messages' },
			React.createElement(
				'h2',
				null,
				''
			),
			this.props.messages.map(function (message, i) {
				return React.createElement(Message, {
					key: i,
					user: message.user,
					text: message.text
				});
			})
		);

	}
});

var MessageForm = React.createClass({
	displayName: 'MessageForm',

	getInitialState: function getInitialState() {
		return { text: '' };
	},

	handleSubmit: function handleSubmit(e) {
		e.preventDefault();
		var elem = document.getElementById('messages')
		elem.scrollTop=elem.scrollHeight;
		
		var message = {
			user: this.props.user,
			text: this.state.text
		};
		this.props.onMessageSubmit(message);
		this.setState({ text: '' });
	},

	changeHandler: function changeHandler(e) {

		this.props.userTyping(this.props.user)
		socket.emit('user:typing', this.props.user);
		this.setState({ text: e.target.value });
	},

	render: function render() {
		return React.createElement(
			'div',
			{ className: 'message_form' },
			React.createElement(
				'h3',
				null,
				'Write New Message'
			),
			React.createElement(
				'form',
				{ onSubmit: this.handleSubmit },
				React.createElement('input', {
					onChange: this.changeHandler,
					value: this.state.text
				})
			)
		);
	}
});



var ChatApp = React.createClass({
	displayName: 'ChatApp',

	getInitialState: function getInitialState() {
		return { users: [], messages: [], text: '' };
	},

	componentDidMount: function componentDidMount() {
		socket.on('init', this._initialize);
		socket.on('send:message', this._messageRecieve);
		socket.on('user:join', this._userJoined);
		socket.on('user:left', this._userLeft);
		socket.on('user:typing', this._userTyping)

	},

	_initialize: function _initialize(data) {
		var users = data.users;
		var name = data.name;

		this.setState({ users: users, user: name });
	},

	_messageRecieve: function _messageRecieve(message) {
		var messages = this.state.messages;
		messages.push(message);
		this.setState({ messages: messages });
	},
	_userJoined: function _userJoined(data) {
		var _state = this.state;
		var users = _state.users;
		var messages = _state.messages;
		var name = data.name;

		users.push(name);
		messages.push({
			user: 'CHATBOT',
			text: name + ' Joined'
		});
		this.setState({ users: users, messages: messages });
	},

	_userLeft: function _userLeft(data) {
		var _state2 = this.state;
		var users = _state2.users;
		var messages = _state2.messages;
		var name = data.name;

		var index = users.indexOf(name);
		users.splice(index, 1);
		messages.push({
			user: 'CHATBOT',
			text: name + ' Left'
		});
		this.setState({ users: users, messages: messages });
	},

	handleMessageSubmit: function handleMessageSubmit(message) {
		var messages = this.state.messages;

		messages.push(message);
		this.setState({ messages: messages });
		socket.emit('send:message', message);
	},

	_userTyping: function _userTyping(e) {
		console.log("inside _userTyping", e)
		var messages=this.state.messages
		var message = e + " is typing..."
		if(isTyping ==false){
			isTyping=true
		messages.push({
			user: e,
			text: 'is typing...'
		});
		this.setState({messages:messages})


		setTimeout(()=>{
		var index = messages.findIndex(x=>x.text=="is typing...")
	
		messages.splice(index,1)
		isTyping=false
			this.setState({messages:messages})
		},500)

		} else {
			return
		}
	
	},



	render: function render() {
		return React.createElement(
			'div',
			null,
			React.createElement(UsersList, {
				users: this.state.users
			}),
			React.createElement(MessageList, {
				messages: this.state.messages
			}),
			React.createElement(MessageForm, {
				onMessageSubmit: this.handleMessageSubmit,
				userTyping:this._userTyping,
				user: this.state.user
			})
		);
	}
});

React.render(React.createElement(ChatApp, null), document.getElementById('app'));
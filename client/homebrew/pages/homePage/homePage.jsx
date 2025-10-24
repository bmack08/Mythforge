import './homePage.less';
import React from 'react';
import createClass from 'create-react-class';
import cx from 'classnames';
import request from '../../utils/request-middleware.js';
import { Meta } from 'vitreum/headtags';

import Nav from 'naturalcrit/nav/nav.jsx';
import Navbar from '../../navbar/navbar.jsx';
import NewBrewItem from '../../navbar/newbrew.navitem.jsx';
import HelpNavItem from '../../navbar/help.navitem.jsx';
import VaultNavItem from '../../navbar/vault.navitem.jsx';
import RecentNavItem from '../../navbar/recent.navitem.jsx';
import AccountNavItem from '../../navbar/account.navitem.jsx';
import ErrorNavItem from '../../navbar/error-navitem.jsx';
import { fetchThemeBundle } from '../../../../shared/helpers.js';

import SplitPane from 'client/components/splitPane/splitPane.jsx';
import Editor from '../../editor/editor.jsx';
import BrewRenderer from '../../brewRenderer/brewRenderer.jsx';
import AiSidebar from '../../editor/aiSidebar/aiSidebar.jsx';

import { DEFAULT_BREW } from '../../../../server/brewDefaults.js';

const HomePage = createClass({
	displayName     : 'HomePage',
	getDefaultProps : function() {
		return {
			brew : DEFAULT_BREW,
			ver  : '0.0.0'
		};
	},
	getInitialState : function() {
		return {
			brew                       : this.props.brew,
			welcomeText                : this.props.brew.text,
			error                      : undefined,
			currentEditorViewPageNum   : 1,
			currentEditorCursorPageNum : 1,
			currentBrewRendererPageNum : 1,
			themeBundle                : {}
		};
	},

	editor : React.createRef(null),

	componentDidMount : function() {
		fetchThemeBundle(this, this.props.brew.renderer, this.props.brew.theme);
	},

	handleSave : function(){
		request.post('/api')
			.send(this.state.brew)
			.end((err, res)=>{
				if(err) {
					this.setState({ error: err });
					return;
				}
				const brew = res.body;
				window.location = `/edit/${brew.editId}`;
			});
	},
	handleSplitMove : function(){
		this.editor.current.update();
	},

	handleEditorViewPageChange : function(pageNumber){
		this.setState({ currentEditorViewPageNum: pageNumber });
	},

	handleEditorCursorPageChange : function(pageNumber){
		this.setState({ currentEditorCursorPageNum: pageNumber });
	},

	handleBrewRendererPageChange : function(pageNumber){
		this.setState({ currentBrewRendererPageNum: pageNumber });
	},

	handleTextChange : function(text){
		this.setState((prevState)=>({
			brew : { ...prevState.brew, text: text },
		}));
	},
	renderNavbar : function(){
		return <Navbar ver={this.props.ver}>
			<Nav.section>
				{this.state.error ?
					<ErrorNavItem error={this.state.error} parent={this}></ErrorNavItem> :
					null
				}
				<NewBrewItem />
				<HelpNavItem />
				<VaultNavItem />
				<RecentNavItem.both />
				<AccountNavItem />
			</Nav.section>
		</Navbar>;
	},

	render : function(){
		return <div className='homePage sitePage'>
			<Meta name='google-site-verification' content='NwnAQSSJZzAT7N-p5MY6ydQ7Njm67dtbu73ZSyE5Fy4' />
			{this.renderNavbar()}
			<div className='content'>
				<SplitPane onDragFinish={this.handleSplitMove}>
					<Editor
						ref={this.editor}
						brew={this.state.brew}
						onTextChange={this.handleTextChange}
						renderer={this.state.brew.renderer}
						showEditButtons={false}
						themeBundle={this.state.themeBundle}
						onCursorPageChange={this.handleEditorCursorPageChange}
						onViewPageChange={this.handleEditorViewPageChange}
						currentEditorViewPageNum={this.state.currentEditorViewPageNum}
						currentEditorCursorPageNum={this.state.currentEditorCursorPageNum}
						currentBrewRendererPageNum={this.state.currentBrewRendererPageNum}
					/>
					<BrewRenderer
						text={this.state.brew.text}
						style={this.state.brew.style}
						renderer={this.state.brew.renderer}
						onPageChange={this.handleBrewRendererPageChange}
						currentEditorViewPageNum={this.state.currentEditorViewPageNum}
						currentEditorCursorPageNum={this.state.currentEditorCursorPageNum}
						currentBrewRendererPageNum={this.state.currentBrewRendererPageNum}
						themeBundle={this.state.themeBundle}
					/>
				</SplitPane>
				<AiSidebar
					brew={this.state.brew}
					onContentGenerate={(content) => {
						const currentText = this.state.brew.text;
						const newText = currentText + '\n\n' + content + '\n\n';
						this.handleTextChange(newText);
					}}
				/>
			</div>
			<div className={cx('floatingSaveButton', { show: this.state.welcomeText != this.state.brew.text })} onClick={this.handleSave}>
				Save current <i className='fas fa-save' />
			</div>

			<a href='/new' className='floatingNewButton'>
				Create your own <i className='fas fa-magic' />
			</a>
		</div>;
	}
});

export default HomePage;

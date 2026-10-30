import './splitPane.less';
import React, { useState, useEffect } from 'react';
import Icon from '../Icon.jsx';

const storageKey = 'naturalcrit-pane-split';

const SplitPane = (props)=>{
	const {
		onDragFinish = ()=>{},
		showDividerButtons = true
	} = props;

	const [isDragging, setIsDragging] = useState(false);
	const [dividerPos, setDividerPos] = useState(null);
	const [moveSource, setMoveSource] = useState(false);
	const [moveBrew, setMoveBrew] = useState(false);
	const [showMoveArrows, setShowMoveArrows] = useState(true);
	const [liveScroll, setLiveScroll] = useState(false);

	useEffect(()=>{
		const savedPos = window.localStorage.getItem(storageKey);
		setDividerPos(savedPos ? limitPosition(savedPos, 0.1 * (window.innerWidth - 13), 0.9 * (window.innerWidth - 13)) : window.innerWidth / 2);
		setLiveScroll(window.localStorage.getItem('liveScroll') === 'true');

		window.addEventListener('resize', handleResize);
		return ()=>window.removeEventListener('resize', handleResize);
	}, []);

	const limitPosition = (x, min = 1, max = window.innerWidth - 13)=>Math.round(Math.min(max, Math.max(min, x)));

	//when resizing, the divider should grow smaller if less space is given, then grow back if the space is restored, to the original position
	const handleResize = ()=>setDividerPos(limitPosition(window.localStorage.getItem(storageKey), 0.1 * (window.innerWidth - 13), 0.9 * (window.innerWidth - 13)));

	const handleUp =(e)=>{
		e.preventDefault();
		if(isDragging) {
			onDragFinish(dividerPos);
			window.localStorage.setItem(storageKey, dividerPos);
		}
		setIsDragging(false);
	};

	const handleDown = (e)=>{
		e.preventDefault();
		setIsDragging(true);
	};

	const handleMove = (e)=>{
		if(!isDragging) return;
		e.preventDefault();
		setDividerPos(limitPosition(e.pageX));
	};

	const liveScrollToggle = ()=>{
		window.localStorage.setItem('liveScroll', String(!liveScroll));
		setLiveScroll(!liveScroll);
	};

	const  renderMoveArrows = (showMoveArrows &&
		<>
			<div className='arrow left'
				onClick={()=>setMoveSource(!moveSource)} >
				<Icon icon='fas fa-arrow-left' />
			</div>
			<div className='arrow right'
				onClick={()=>setMoveBrew(!moveBrew)} >
				<Icon icon='fas fa-arrow-right' />
			</div>
			<div id='scrollToggleDiv' className={liveScroll ? 'arrow lock' : 'arrow unlock'}
				onClick={liveScrollToggle} >
				<Icon id='scrollToggle' icon={liveScroll ? 'fas fa-lock' : 'fas fa-unlock'} />
			</div>
		</>
	);

	const renderDivider = (
		<div className={`divider ${isDragging && 'dragging'}`} onPointerDown={handleDown}>
			{showDividerButtons && renderMoveArrows}
			{/* One grip instead of three stacked 6px font dots (UNIT M5). Three
			  * circles at 6px were three glyphs standing in for one affordance,
			  * and at that size a stroked circle is mush; `grip-vertical` IS
			  * six dots, drawn to be read at this size. */}
			<div className='dots'>
				<Icon icon='grip-vertical' />
			</div>
		</div>
	);

	return (
		<div className='splitPane' onPointerMove={handleMove} onPointerUp={handleUp}>
			<Pane width={dividerPos} moveBrew={moveBrew} moveSource={moveSource} liveScroll={liveScroll} setMoveArrows={setShowMoveArrows}>
				{props.children[0]}
			</Pane>
			{renderDivider}
			<Pane isDragging={isDragging}>{props.children[1]}</Pane>
		</div>
	);
};

const Pane = ({ width, children, isDragging, moveBrew, moveSource, liveScroll, setMoveArrows })=>{
	const styles = width
		? { flex: 'none', width: `${width}px` }
		: { pointerEvents: isDragging ? 'none' : 'auto' }; //Disable mouse capture in the right pane; else dragging into the iframe drops the divider

	return (
		<div className='pane' style={styles}>
		{React.cloneElement(children, { moveBrew, moveSource, liveScroll, setMoveArrows })}
	</div>
	);
};

export default SplitPane;

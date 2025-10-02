if (typeof window !== 'undefined') {
    try {
        const req = eval('require');
        req('./toast.less');
    } catch (_) {}
}
const React = require('react');
const createClass = require('create-react-class');

// Lightweight global toast utility. Mount <ToastHost /> once near the app root.
// Use window.NCToast.show({ message, type, duration }) to display a toast.

const ToastHost = createClass({
	displayName : 'ToastHost',
	getInitialState(){
        return { visible: false, message: '', type: 'info', duration: 3000 };
    },
	componentDidMount(){
        // Expose a simple global helper
        const api = {
            show: ({ message, type = 'info', duration = 3000 }={}) => {
                clearTimeout(this._hideTimer);
                this.setState({ visible: true, message, type, duration });
                this._hideTimer = setTimeout(()=> this.hide(), duration);
            },
            hide: () => this.hide()
        };
        window.NCToast = api; // namespaced to avoid collisions
    },
    componentWillUnmount(){
        clearTimeout(this._hideTimer);
        if(window.NCToast && window.NCToast.hide === this.hide){
            delete window.NCToast;
        }
    },
    hide(){
        this.setState({ visible: false });
    },
    render(){
        if(!this.state.visible) return null;
        const type = this.state.type || 'info';
        const iconClass = type === 'success' ? 'fas fa-check-circle' : type === 'error' ? 'fas fa-times-circle' : type === 'warning' ? 'fas fa-exclamation-triangle' : 'fas fa-info-circle';
        return (
            <div className={`nc-toast ${type}`} role='status' aria-live='polite'>
                <i className={`nc-toast__icon ${iconClass}`}></i>
                <div className='nc-toast__message'>{this.state.message}</div>
                <button className='nc-toast__close' aria-label='Close' onClick={this.hide}>×</button>
            </div>
        );
    }
});

module.exports = ToastHost;

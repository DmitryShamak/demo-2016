var startElement;
var Connector = function(target) {
    if(!startElement) {
        startElement = document.getElementById("start");
    }

    var directionY = startElement.offsetTop < target.offsetTop ? "Top" : "Bottom";

    return {
        connector: "Flowchart",
        paintStyle:{lineWidth: 1,strokeStyle: "#878787"},
        hoverPaintStyle:{strokeStyle: "#878787"},
        endpoint: "Blank",
        anchors: ["Right", directionY],
        overlays:[ ["PlainArrow", {location:1, width:15, length:12} ]]
    }
};

module.exports = React.createClass({
    handleDelete: function() {
        this.setState({
            deleted: true
        });

        var element = ReactDOM.findDOMNode(this);
        var container = element.parentNode;
        ReactDOM.unmountComponentAtNode(element);
        //container.removeChild(element);

        this.props.removeDataBlock(this.state.id);
    },
    startDrag: function(pointerProps) {
        this.setState({
            isDragged: true,
            pointerProps: pointerProps
        });
    },
    stopDrag: function() {
        this.setState({
            isDragged: false
        });

        this.props.saveProgress(this.toJSON(this.state));
    },
    toggleContent: function() {
        var showContent = !this.state.showContent;
        var parentWidth = 0;
        if(showContent) {
            parentWidth = ReactDOM.findDOMNode(this).clientWidth;
        }

        this.setState({
            showContent: showContent,
            parentWidth: parentWidth
        });
    },
    updateItem: function(itemId) {
        var item = this.state.items.filter(function(item) {
            return item.id == itemId;
        })[0];
        if(!item) {
            return;
        }

        var label = prompt("Label", item.label);
        if(!label || label.trim() ===  item.label) {
            return;
        }

        item.label = label;
        this.props.updateData(this.toJSON(this.state));

        this.setState(this.state);
    },
    removeItem: function(itemId) {
        var item = this.state.items.filter(function(item) {
            return item.id == itemId;
        })[0];
        if(!item) {
            return;
        }

        this.state.items.splice(this.state.items.indexOf(item), 1);
        this.props.updateData(this.toJSON(this.state));

        this.setState(this.state);
    },
    addItem: function() {
        var label = prompt("Label", "To Do Item");

        if(!label) {
            return;
        }

        var items = this.state.items;
        items.push({
            id: Date.now(),
            label: label
        });
        this.setState({
            items: items
        });
        this.props.saveProgress(this.toJSON(this.state));
    },
    onMouseOut: function() {
        if(this.state.isDragged) {
            this.stopDrag();
        }
        this.props.notify("onMouseOut");
    },
    onMouseUp: function() {
        if(this.state.isDragged) {
            this.stopDrag();
        }
        this.props.notify("onMouseUp");
    },

    onMouseMove: function(event) {
        if(this.state.isDragged) {
            var target = event.target;
            var pointerPosition = {
                x: event.clientX,
                y: event.clientY
            };

            this.setState({
                position: {
                    top: pointerPosition.y - this.state.pointerProps.offsetY,
                    left: pointerPosition.x - this.state.pointerProps.offsetX
                }
            });
        }
    },
    onMouseDown: function(event) {
        if(this.props.deleteMode) {
            return;
        }

        this.startDrag({
            offsetX: event.clientX - this.state.position.left,
            offsetY: event.clientY - this.state.position.top
        });
        this.props.notify("onMouseDown");
    },
    onMouseClick: function() {
        this.props.notify("onMouseClick");
        if(this.props.deleteMode) {
            this.handleDelete();
        } else {
            this.toggleContent();
        }

    },
    connect: function() {
        var id = this.state.id.toString();
        this.connection = jsPlumb.connect({
            source: "start",
            target: id
        }, new Connector(ReactDOM.findDOMNode(this)));
    },
    toJSON: function(data) {
        var cleanObj = {
            id: data.id,
            position: data.position,
            title: data.title,
            items: data.items || []
        };

        return cleanObj;
    },
    componentWillReceiveProps: function(props) {
        var data = this.toJSON(props.data);
        this.setState(data);
    },
    connection: undefined,
    getInitialState: function() {
        var state = {};

        var data = this.props.data || {};
        if(!data.position) {
            data.position = {
                top: 100,
                left: 100
            };
            data = this.toJSON(data);
            this.props.saveProgress(data);
        }
        $.extend(state, data);

        return state;
    },
    componentDidUpdate: function(props) {
        if(this.connection) {
            jsPlumb.detach(this.connection);
        }
        this.connect();
    },
    componentDidMount: function(props) {
        if(this.connection) {
            jsPlumb.detach(this.connection);
        }
        this.connect();
    },
    render: function() {
        var self = this;

        return (
            <div id={self.state.id} className="data-block pointer shadow-primary" style={self.state.position}>
                <div className="title text-center" onClick={self.onMouseClick.bind(this)}
                    onMouseMove={self.onMouseMove.bind(this)} onMouseDown={self.onMouseDown.bind(this)} onMouseUp={self.onMouseUp.bind(this)}
                    onMouseOut={self.onMouseOut.bind(this)}>{self.state.title}</div>
                <div className={'content' + (self.state.showContent ? "" : " hidden")} style={ {maxWidth: self.state.parentWidth ? (self.state.parentWidth + 'px') : 'none'} }>
                    {
                        self.state.items && self.state.items.length > 0 ?
                        <div className="items">{
                            self.state.items && self.state.items.map(function(item) {
                                return <div className="item">
                                    <div className="item-label">{item.label}</div>
                                    <div className="item-control">
                                        <i className="button pointer fa fa-pencil-square" onClick={self.updateItem.bind(self, item.id)}></i>
                                        <i className="button pointer fa fa-times-circle" onClick={self.removeItem.bind(self, item.id)}></i>
                                    </div>
                                </div>
                            })
                        }</div> : ''
                    }

                    <div className="btn btn-default text-center" onClick={self.addItem}>
                        <i className="fa fa-plus-circle"></i>
                    </div>
                </div>
            </div>
        );
    }
});
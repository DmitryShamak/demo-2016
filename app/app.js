var styles = require("./style/main.scss");

var DataBlock = require("./js/dataBlock.js");
var allowDebug = false;

var App = React.createClass({
    onKeyUp: function(event) {
        if(event.keyCode === 17) {
            this.setState({
                deleteMode: false
            });

            this.notify("CTRL onKeyUp");
        }
    },
    onKeyDown: function(event) {
        if(event.keyCode === 17 && !this.state.deleteMode) {
            this.setState({
                deleteMode: true
            });

            this.notify("CTRL onKeyDown");
        }
    },
    notify: function(message) {
        allowDebug && console.info(message);
    },
    getStore: function() {
        return (JSON.parse(localStorage.getItem("editor")) || []);
    },
    setStore: function(data) {
        localStorage.setItem("editor", JSON.stringify(data || []));
    },
    updateData: function(data) {
        if(!data || !data.id) {
            return;
        }

        var store = this.getStore();
        var targetItem = store.filter(function(item) {
            return item.id == data.id;
        })[0];
        if(!targetItem) {
            return;
        }
        $.extend(targetItem, data);
        this.setStore(store);
    },
    saveProgress: function(obj) {
        if(!obj.id) {
            return;
        }

        var store = this.getStore();
        var storeItem = store.filter(function(item) {
            return item.id == obj.id;
        })[0];

        if(storeItem) {
            $.extend(storeItem, obj);
        } else {
            store.push(obj);
        }

        this.setStore(store);
        this.setState({
            items: store
        })
    },
    addDataBlock: function() {
        var title = prompt("Title", "To Do");

        var items = this.state.items;
        items.push({
            id: Date.now(),
            title: title
        });
        this.setState({
            items: items
        });
    },
    removeDataBlock: function(itemId) {
        var items = this.state.items;
        var targetItem = items.filter(function(item) {
            return item.id == itemId;
        })[0];

        if(targetItem) {
            items.splice(items.indexOf(targetItem), 1);
        }
        this.setStore(items);
        this.setState({
            "items": items,
            update: true
        });
    },
    getInitialState: function() {
        var self = this;
        var storage = this.getStore();

        window.addEventListener("keydown", self.onKeyDown, false);
        window.addEventListener("keyup", self.onKeyUp, false);

        return {
            items: storage,
            deleteMode: false,
            update: false
        }
    },
    render: function() {
        var self = this;

        return <div id="app-canvas" className={'no-selection ' + (self.state.deleteMode ? 'delete-mode' : '')}>
            <div id="start" className="shadow-primary">Start</div>
            <div id="items">{
                self.state.items.map(function (props) {
                    return < DataBlock data={props} updateData={self.updateData} update={self.state.update} deleteMode={self.state.deleteMode} removeDataBlock={self.removeDataBlock} notify={self.notify} saveProgress={self.saveProgress} />
                })
            }</div>
            <div id="add" className="pictograph pointer shadow-primary" onClick={self.addDataBlock.bind(this)}>+</div>
        </div>;
    }

});

$(document).ready(function() {
    var content = document.getElementById("content");

    ReactDOM.render(
        <App />,
        content
    );
});
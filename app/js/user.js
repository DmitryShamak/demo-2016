function User() {
    var container = document.createElement("div");
        container.id = "user-canvas";

    var self = this;
    var isMounted = false;

    var Component = React.createClass({
        render: function() {
            return (
                <div className="user"><h2>USER</h2></div>
            );
        }
    });

    var init = function() {
        ReactDOM.render(
          <Component />,
          container
        );

        isMounted = true;
        document.body.appendChild(container);
    };

    self.remove = function() {
        if(!isMounted) {
            return;
        }

        isMounted = false;
        ReactDOM.unmountComponentAtNode(container);
        document.body.removeChild(container);
    };

    self.create = function() {
        init();
        console.log("user created");
    }
}

module.exports = React.createClass({
    render: function() {
        return (
            <div className="module disabled">
                <div className="module-user"><h2>USER</h2></div>
            </div>
        );
    }
});
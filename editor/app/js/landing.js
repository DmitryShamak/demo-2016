module.exports = React.createClass({
    getInitialState: function() {
      $(document).bind("submit", "form", function(e) {e.preventDefault();} );

      return {
        form: {},
        onchange: function(key, event) {
            var target = event.target;
            var value = target.value.trim();
            var valid = value != "";
            var form = this.state.form;

            $(target).removeClass("invalid");

            form[key] = {
                valid: valid,
                value: value,
                target: target
            };

            if(!valid) {
                $(target).addClass("invalid");
            }

            target.value = value;
            return value;
        },
        signin: function(e) {
            e.preventDefault();

            var form = this.state.form;
            if(!form.email || !form.email.valid || !form.password || !form.password.valid) {
                return;
            }

            localStorage.setItem("user", JSON.stringify({
                email: form.email.value
            }));

            form = {};
            this.props.parent.router.go.call(this, "map");
        }
      }
    },
    render: function() {
        localStorage.removeItem("user");

        return (
            <div className="account no-selection text-center module-account">
                <h2>Landing</h2>

                <form className="fixed-xs-width" onSubmit={this.state.signin.bind(this)}>
                    <div className="form-group">
                        <input className="form-control" type="text" onChange={this.state.onchange.bind(this, "email")} placeholder="email" />
                    </div>
                    <div className="form-group">
                        <input className="form-control" type="password" onChange={this.state.onchange.bind(this, "password")} placeholder="password" />
                    </div>
                    <button className="btn form-control" onClick={this.state.signin.bind(this)}>Sign In</button>
                </form>
            </div>
        );
    }
});
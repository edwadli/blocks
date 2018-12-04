'use strict';

class NavBarComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user_info: null,
      is_loading: false,
      text_value: '',
    };
    
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  
  // Loads the user data from the server.
  readUserData() {
    this.setState({ is_loading: true })
    return fetch('/api/profile/read', {method: 'POST'})
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({
          is_loading: false,
          user_info: responseJson,
        }, function(){
        });
      })
      .catch((error) =>{
        console.error(error);
      });
  }
  
  // Writes username data to the server.
  writeUserData(json_payload) {
    return fetch('/api/profile/update', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(json_payload),
    }).catch((error) =>{
        console.error(error);
      });
  }
  
  // On keystroke for text box.
  handleChange(event) {
    this.setState({text_value: event.target.value});
  }
  
  // On submit for text box.
  handleSubmit(event) {
    this.writeUserData({name: this.state.text_value});
    event.preventDefault();
  }

  componentDidMount() {
    return this.readUserData();
  }

  render() {
    return (
      <div>
        <span>Account Info</span>
        <div>
          {this.state.is_loading ?
            "Loading..." : JSON.stringify(this.state.user_info)}
        </div>
        <form onSubmit={this.handleSubmit}>
         <label>
           Name:
            <input type="text" value={this.state.text_value} onChange={this.handleChange} />
         </label>
         <input type="submit" value="Submit" />
        </form>
        <button onClick={() => this.readUserData()}>
          RefreshInfo
        </button>
      </div>
    );
  }
}

const navbar = document.querySelector('#navbar');
ReactDOM.render(<NavBarComponent />, navbar);
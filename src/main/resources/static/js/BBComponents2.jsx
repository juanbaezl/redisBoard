// Retorna la url del servicio. Es una función de configuración.
function BBServiceURL() {
    var url = WShostURL() + '/bbService';
    console.log("BBService URL Calculada: " + url);
    return url;
}
// Retorna la url del servicio. Es una función de configuración.
function ticketServiceURL() {
    var url = RESThostURL() + '/getticket';
    console.log("ticketService URL Calculada: " + url);
    return url;
}
// Retorna la url del servicio. Es una función de configuración.
function WShostURL() {
    var host = window.location.host;
    var url = 'ws://' + (host);
    console.log("host URL Calculada: " + url);
    return url;
}
// Retorna la url del servicio. Es una función de configuración.
function RESThostURL() {
    var host = window.location.host;
    var protocol = window.location.protocol;
    var url = protocol + '//' + (host);
    console.log("host URL Calculada: " + url);
    return url;
}
// Retorna la url del servicio. Es una función de configuración.
async function getTicket() {
    const response = await fetch(ticketServiceURL());
    console.log("ticket: " + response);
    return response;
}

class WSBBChannel {
    constructor(URL, callback) {
        this.URL = URL;
        this.wsocket = new WebSocket(URL);
        this.wsocket.onopen = (evt) => this.onOpen(evt);
        this.wsocket.onmessage = (evt) => this.onMessage(evt);
        this.wsocket.onerror = (evt) => this.onError(evt);
        this.receivef = callback;
    }


    async onOpen(evt) {
        console.log("In onOpen", evt);
        var response = await getTicket();
        var json;
        if (response.ok) {
            // // if HTTP-status is 200-299
            // get the response body (the method explained below)
            json = await response.json();
        } else {
            console.log("HTTP-Error: " + response.status);
        }
        this.wsocket.send(json.ticket);
    }
    onMessage(evt) {
        console.log("In onMessage", evt);
        // Este if permite que el primer mensaje del servidor no se tenga en cuenta.
        // El primer mensaje solo confirma que se estableció la conexión.
        // De ahí en adelante intercambiaremos solo puntos(x,y) con el servidor
        if (evt.data != "Connection established.") {
            this.receivef(evt.data);
        }
    }
    onError(evt) {
        console.error("In onError", evt);
    }

    send(x, y) {
        let msg = '{ "x": ' + (x) + ', "y": ' + (y) + "}";
        console.log("sending: ", msg);
        this.wsocket.send(msg);
    }


}


class BBCanvas extends React.Component {
    constructor(props) {
        super(props);
        this.comunicationWS =
                new WSBBChannel(BBServiceURL(),
                        (msg) => {
                    var obj = JSON.parse(msg);
                    console.log("On func call back ", msg);
                    this.drawPoint(obj.x, obj.y);
                });
        this.myp5 = null;
        this.state = {loadingState: 'Loading Canvas ...'}
        let wsreference = this.comunicationWS;
        this.sketch = function (p) {

            p.setup = function () {
                p.createCanvas(700, 410);
            };


            p.draw = function () {
                if (p.mouseIsPressed === true) {
                    p.fill(0, 0, 0);
                    p.ellipse(p.mouseX, p.mouseY, 20, 20);
                    wsreference.send(p.mouseX, p.mouseY);
                }
                if (p.mouseIsPressed === false) {
                    p.fill(255, 255, 255);
                }
            };
        }
    }
    
    drawPoint(x, y) {
        this.myp5.ellipse(x, y, 20, 20);
    }

    componentDidMount() {
        this.myp5 = new p5(this.sketch, 'container');
        this.setState({loadingState: 'Canvas Loaded'});
    }

    render()
    {
        return(
                <div>
                    <h4>Drawing status: {this.state.loadingState}</h4>
                </div>);
    }
}

class Editor extends React.Component {
    render() {
        return (
                <div>
                    <h1>Hello, {this.props.name}</h1>
                    <hr/>
                    <div id="toolstatus"></div>
                    <hr/>
                    <div id="container"></div>
                    <BBCanvas/>
                    <hr/>
                    <div id="info"></div>                    
                </div>
                );
    }
}

ReactDOM.render(
        <Editor name="Daniel"/>,
        document.getElementById('root')
        );
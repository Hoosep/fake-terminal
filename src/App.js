import React, { Component } from 'react';
import Terminal from 'terminal-in-react';
//import PseudoFileSystem from 'terminal-in-react-pseudo-file-system-plugin'
import PseudoFileSystem from './pseudo-system/index';
//const FileSystemPlugin = PseudoFileSystem("/", "db");

class App extends Component {
  render() {
    return (
      <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh"
          }}
        >
          <Terminal
            plugins={[
              new PseudoFileSystem("/", "db")
            ]}
            prompt="white"
            startState="maximised"
            allowTabs={false}
            color='white'
            backgroundColor='black'
            barColor='black'
            style={{ fontWeight: "bold", fontSize: "1em" }}
            descriptions={{
            }}
            closedTitle="¡Oh, oh! Cerraste la terminal"
            closedMessage="Da clic en el icono para volverla a abrir"
            msg="Escribe help para que veas los comandos disponibles"
          />
        </div>
    );   
  }
}

/* function App() {
  return (
    <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh"
        }}
      >
        <Terminal
          plugins={[{
            displayName: 'pseudo',
            load: new PseudoFileSystem("/", "db"),
            commands: {
              'type-algo': () => {
                return 'type-algo yeah!'
              }
            },
            descriptions: {
              'type-algo': 'hello'
            }
          }]}
          prompt="white"
          startState="maximised"
          allowTabs={false}
          color='white'
          backgroundColor='black'
          barColor='black'
          style={{ fontWeight: "bold", fontSize: "1em" }}
          descriptions={{
          }}
          closedTitle="¡Oh, oh! Cerraste la terminal"
          closedMessage="Da clic en el icono para volverla a abrir"
          msg="Escribe help para que veas los comandos disponibles"
        />
      </div>
  );
} */

export default App;

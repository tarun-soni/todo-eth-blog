import React, { useEffect, useState } from "react";
import getWeb3 from "./utils/getWeb3";
import Tasks from "./abis/Tasks.json";
import "./App.css";
const App = () => {
  const [todoState, setTodoState] = useState({
    web3: null,
    instance: null,
    account: "",
  });
  const [todos, setTodos] = useState(null);
  const [inputString, setInputString] = useState("");
  const [loading, setLoading] = useState(false);

  const init = async () => {
    const web3 = getWeb3();
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = Tasks.networks[networkId];

    let _instance = new web3.eth.Contract(Tasks.abi, deployedNetwork.address);

    const account = _instance.givenProvider.selectedAddress;

    setTodoState({ web3, instance: _instance, account });
    if (_instance) {
      const _task = await _instance.methods.getTasks().call();
      setTodos(_task);
    }
  };

  useEffect(() => {
    init();
  }, [loading]);

  const onAddToDo = async (e) => {
    e.preventDefault();
    setLoading(true);
    await todoState.instance.methods
      .setTasks(inputString)
      .send({ from: todoState.account })
      .then((res) => {
        console.log("res :>> ", res);
        setLoading(false);
      });
  };

  return !todoState && !todoState.contract ? (
    <div>Loading Web3, accounts, and contract...</div>
  ) : (
    <div className="App">
      <h3>
        Current account <br></br> {todoState.account}
      </h3>

      <form onSubmit={(e) => onAddToDo(e)}>
        <input
          label="Insert Text"
          onChange={(e) => setInputString(e.target.value)}
          value={inputString}
        />
        <button type="submit" disabled={!inputString.length}>
          ADD
        </button>
      </form>

      <h3>Todos</h3>
      <ul>
        {todos?.map((todo) => (
          <li key={todo.id}>
            <p>{todo}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;

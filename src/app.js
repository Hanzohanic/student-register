import Web3 from "web3";
import { newKitFromWeb3 } from "@celo/contractkit";
import BigNumber from "bignumber.js";
import studentAbi from "../contract/student.abi.json";
import erc20Abi from "../contract/erc20.abi.json";



require('normalize.css/normalize.css');
require('./styles/Highlight-Clean.css');
require('./styles/Navigation-Clean.css');
require('./styles/style.css');

const ERC20_DECIMALS = 18;
const MPContractAddress = "0x2e768875D2B33E66B30f82Cd34eb886DF40aa473";
const cUSDContractAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";

let kit;
let contract;
let students = [];



const connectCeloWallet = async function () {
    if (window.celo) {
      notification("Please approve this DApp to use it.");
      try {
        await window.celo.enable();
        notificationOff();
  
        const web3 = new Web3(window.celo);
        kit = newKitFromWeb3(web3);
  
        const accounts = await kit.web3.eth.getAccounts();
        kit.defaultAccount = accounts[0];
  
        contract = new kit.web3.eth.Contract(studentAbi, MPContractAddress);
      } catch (error) {
        notification(`${error}.`);
      }
    } else {
      notification("Please install the CeloExtensionWallet.");
    }
  };
  
  async function approve(_tuitionFee) {
    const cUSDContract = new kit.web3.eth.Contract(erc20Abi, cUSDContractAddress)
    const result = await cUSDContract.methods
      .approve(MPContractAddress, _tuitionFee)
      .send({ from: kit.defaultAccount })
    return result
  }
  
  const getBalance = async function () {
    const totalBalance = await kit.getTotalBalance(kit.defaultAccount);
    const cUSDBalance = totalBalance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2);
    document.querySelector("#balance").textContent = cUSDBalance;
  };
  
  const getStudents = async function () {
    const _studentsLength = await contract.methods.getStudentLength().call();
    const _students = [];
    for (let i = 0; i < _studentsLength; i++) {
      let _student = new Promise(async (resolve, reject) => {
        let p = await contract.methods.students(i).call();
        resolve({
          index: i,
          owner: p[0],
          image: p[1],
          studentId: p[2],
          name: p[3],
          studyMajor: p[4],
          tuitionFee: new BigNumber(p[5]),
        });
      });
      _students.push(_student);
    }
    students = await Promise.all(_students);
    displayStudent();
  };


  function displayStudent() {
    document.getElementById("student").innerHTML = "";
    students.forEach((_student) => {
      const newDiv = document.createElement("div");
      newDiv.className = "col-md-4";
      newDiv.innerHTML = studentTemplate(_student);
      document.getElementById("student").appendChild(newDiv);
    });
  }

  function studentTemplate(_student) {
    return `
      <div class="card mb-4" style="background-color: white; color: #000">
        <img class="card-img-top" src="${_student.image}" alt="...">
        <div class="position-absolute top-0 end-0 bg-success mt-4 px-2 py-1 rounded-start">
         Student-ID ${_student.studentId} 
        </div>
        <div class="card-body text-left p-4 position-relative">
          <div class="translate-middle-y position-absolute top-0">
          ${identiconTemplate(_student.owner)}
          </div>
          <h4 class="card-title">Name: ${
            _student.name
          }</h4>
          <p class="card-text mb-4">
           Major:  ${_student.studyMajor}             
          </p>
          <div class="d-grid gap-2">
            <a class="btn btn-sm btn-outline-dark payFees fs-6 p-3" id=${
              _student.index
            }>
            Pay:${_student.tuitionFee.shiftedBy(-ERC20_DECIMALS).toFixed(2)}  cUSD
            </a>
          </div>
        </div>
      </div>
    `;
  }

  function identiconTemplate(_address) {
    const icon = blockies
      .create({
        seed: _address,
        size: 8,
        scale: 16,
      })
      .toDataURL();
  
    return `
      <div class="rounded-circle overflow-hidden d-inline-block border border-white border-2 shadow-sm m-0">
        <a href="https://alfajores-blockscout.celo-testnet.org/address/${_address}/transactions"
            target="_blank">
            <img src="${icon}" width="48" alt="${_address}">
        </a>
      </div>
      `;
  }
  
  function notification(_text) {
    document.querySelector(".alert").style.display = "block";
    document.querySelector("#notification").textContent = _text;
  }
  
  function notificationOff() {
    document.querySelector(".alert").style.display = "none";
  }
  
  window.addEventListener("load", async () => {
    notification("Loading please wait...");
    await connectCeloWallet();
    await getBalance();
    await getStudents();
    notificationOff();
  });

  document.querySelector("#student").addEventListener("click", async (e) => {
    if (e.target.className.includes("payFees")) {
      const index = e.target.id;
      notification("Waiting for your payment to be approved please wait...");
      try {
        await approve(students[index].tuitionFee);
      } catch (error) {
        notification(`${error}.`);
      }
      notification(`Awaiting payment for "${students[index].name}"...`);
      try {
        const result = await contract.methods
          .payTuition(index)
          .send({ from: kit.defaultAccount });
        notification(
          `You successfully paid your tuition "${students[index].name}".`
        );
        getStudents();
        getBalance();
      } catch (error) {
        notification(`${error}.`);
      }
    }
  });
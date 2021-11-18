import Web3 from "web3";
import { newKitFromWeb3 } from "@celo/contractkit";
import BigNumber from "bignumber.js";
import marketplaceAbi from "../contract/marketplace.abi.json";
import erc20Abi from "../contract/erc20.abi.json";

const ERC20_DECIMALS = 18;

// const MPContractAddress = "0x5a6D151E24c19a95cEE7c991F3F4fDdB0Ce50Dc9";
const MPContractAddress = "0xBf40Db08136a8783477Aa4462A8eE9C9192CE543";
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

      contract = new kit.web3.eth.Contract(marketplaceAbi, MPContractAddress);
    } catch (error) {
      notification(`${error}.`);
    }
  } else {
    notification("Please install the CeloExtensionWallet.");
  }
};

async function approve(_fees) {
  const cUSDContract = new kit.web3.eth.Contract(erc20Abi, cUSDContractAddress);

  const result = await cUSDContract.methods
    .approve(MPContractAddress, _fees)
    .send({ from: kit.defaultAccount });
  return result;
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
        fees: new BigNumber(p[5]),
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
    <div class="card mb-4" style="background-color: #2FDD92; color: white">
      <img class="card-img-top" src="${_student.image}" alt="...">
      <div class="position-absolute top-0 end-0 bg-success mt-4 px-2 py-1 rounded-start">
       Student-ID ${_student.studentId} 
      </div>
      <div class="card-body text-left p-4 position-relative">
        <div class="translate-middle-y position-absolute top-0">
        ${identiconTemplate(_student.owner)}
        </div>
        <h2 class="card-title fs-4 fw-bold mt-2">Student Name: ${
          _student.name
        }</h2>
        <p class="card-text mb-4" style="min-height: 50px">
         Currently Studying:  ${_student.studyMajor}             
        </p>
        <div class="d-grid gap-2">
          <a class="btn btn-lg btn-outline-light payFees fs-6 p-3" id=${
            _student.index
          }>
            Tuition Fee to be paid is ${_student.fees
              .shiftedBy(-ERC20_DECIMALS)
              .toFixed(2)} cUSD
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

document
  .querySelector("#newStudentBtn")
  .addEventListener("click", async (e) => {
    const params = [
      document.getElementById("image").value,
      document.getElementById("stud_id").value,
      document.getElementById("name").value,
      document.getElementById("major").value,
      new BigNumber(document.getElementById("fees").value)
        .shiftedBy(ERC20_DECIMALS)
        .toString(),
    ];
    notification(`Adding "${params[2]}"`);
    try {
      const result = await contract.methods
        .createStudent(...params)
        .send({ from: kit.defaultAccount });
    } catch (error) {
      notification(`${error}.`);
    }
    notification(`You successfully added "${params[2]}".`);
    getStudents();
  });

document.querySelector("#student").addEventListener("click", async (e) => {
  if (e.target.className.includes("payFees")) {
    const index = e.target.id;
    notification("Waiting for your payment to be approved please wait...");
    try {
      await approve(students[index].fees);
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

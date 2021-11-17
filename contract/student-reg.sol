// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

interface IERC20Token {
  function transfer(address, uint256) external returns (bool);
  function approve(address, uint256) external returns (bool);
  function transferFrom(address, address, uint256) external returns (bool);
  function totalSupply() external view returns (uint256);
  function balanceOf(address) external view returns (uint256);
  function allowance(address, address) external view returns (uint256);

  event Transfer(address indexed from, address indexed to, uint256 value);
  event Approval(address indexed owner, address indexed spender, uint256 value);
}


contract StudentRegistration {

    uint internal studentsLength = 0;
    address internal cUsdTokenAddress = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;
    
    struct Student{
        address payable owner;
        string image;
        string studentId;
        string name;
        string studyMajor;
        uint fees;
    }

    mapping (uint => Student) internal students;

    function createStudent(
        string memory _image,
        string memory _studentId,
        string memory _name,
        string memory _studyMajor,
        uint _fees
        ) public {
        students[studentsLength] = Student(
            payable(msg.sender),
            _image,
            _studentId,
            _name,
            _studyMajor,
            _fees
            );
            studentsLength++;
    }

    function viewStudent(uint _index) public view returns (
        address payable,
        string memory, 
        string memory, 
        string memory, 
        string memory, 
        uint
    ) {
        return (
            students[_index].owner,
            students[_index].image, 
            students[_index].studentId, 
            students[_index].name, 
            students[_index].studyMajor,
            students[_index].fees
        );
    }
    
   
    
    function payTuition(uint _index) public payable  {
        require(
          IERC20Token(cUsdTokenAddress).transferFrom(
            msg.sender,
            students[_index].owner,
            students[_index].fees
          ),
          "Transfer failed."
        );
    }
    
    function getStudentLength() public view returns (uint) {
        return (studentsLength);
    }
}
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

    uint internal studentsLength ;
    address internal cUsdTokenAddress ;
    // how long the paid tuition will last in seconds
    uint public tuitionPeriod;
    // cost of tuition
    uint public tuitionFee;
    address payable schoolAddress;
    
    struct Student{
        address payable owner;
        string image;
        string studentId;
        string name;
        string studyMajor;
        bool expelled;
        // time till student pays tuition again
        uint tuitionDate;
    }
    
    

    mapping (uint => Student) public students;
    
    constructor(){
        studentsLength = 0;
        cUsdTokenAddress = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;
        tuitionPeriod = 5000;
        tuitionFee = 2 * 1 ether;
        // school address is the address that deployed this contract
        schoolAddress = payable(msg.sender);
    
    }

    modifier onlyAdmin () {
        require(msg.sender == schoolAddress, "Only admin can call this function");
        _;
    }
    
    function createStudent(
        string calldata _image,
        string calldata _studentId,
        string calldata _name,
        string calldata _studyMajor
        ) public {
        bool _expelled = false;
        uint _tuitionDate = block.timestamp;
        students[studentsLength] = Student(
            
            payable(msg.sender),
            _image,
            _studentId,
            _name,
            _studyMajor,
            _expelled,
            _tuitionDate
            );
            studentsLength++;
            
    }

   
    
    function payTuition(uint _index) public payable  {
        require(
          IERC20Token(cUsdTokenAddress).transferFrom(
            msg.sender,
            schoolAddress,
            tuitionFee
          ),
          "Transfer failed."
        );
        
        uint _date = students[_index].tuitionDate;
        // update the time till next pay
        students[_index].tuitionDate =  _date + tuitionPeriod;

    }
    
    
    // check if the student has paid tuition
     function getTuitionStatus(uint _index) public view returns (bool)  {
         if(students[_index].tuitionDate < block.timestamp){
            //  user has not paid
             return false;
         }else{
            //  user has paid
             return true;
         }
       

    }
    
    
    
    function getStudentLength() public view returns (uint) {
        return (studentsLength);
    }
    
    //  ADMIN FUNCTIONALITIES
    
     
    function expelStudent(uint _index) public onlyAdmin {
        students[_index].expelled = true;
        
    }
    
      
    function revokeOwnership(address _address) public onlyAdmin {
        schoolAddress = payable(_address);
        
    }
    
      
    function changeTuitionFee(uint _fee) public onlyAdmin {
        tuitionFee = _fee * 1 ether;
        
    }
    
    function changeTuitionPeriod(uint _duration) public onlyAdmin {
        tuitionPeriod =  _duration;
        
    }
    
    
    
    
    
    
}
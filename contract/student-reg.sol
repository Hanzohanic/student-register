// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

interface IERC20Token {
    function transfer(address, uint256) external returns (bool);

    function approve(address, uint256) external returns (bool);

    function transferFrom(
        address,
        address,
        uint256
    ) external returns (bool);

    function totalSupply() external view returns (uint256);

    function balanceOf(address) external view returns (uint256);

    function allowance(address, address) external view returns (uint256);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
}

contract StudentRegistration {
    uint256 internal studentsLength;
    address internal cUsdTokenAddress;
    address payable schoolAddress;

    struct Student {
        address payable owner;
        string image;
        string studentId;
        string name;
        string studyMajor;
        uint256 tuitionFee;
        uint256 tuitionDate;
    }

    mapping(uint256 => Student) public students;

    constructor() {
        studentsLength = 0;
        cUsdTokenAddress = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;
        // school address is the address that deployed this contract
        schoolAddress = payable(msg.sender);
    }

    function createStudent(
        string calldata _image,
        string calldata _studentId,
        string calldata _name,
        string calldata _studyMajor,
        uint256 _tuitionFee
    ) public {
        uint256 _tuitionDate = block.timestamp;
        students[studentsLength] = Student(
            payable(msg.sender),
            _image,
            _studentId,
            _name,
            _studyMajor,
            _tuitionFee,
            _tuitionDate
        );
        studentsLength++;
    }

    function payTuition(uint256 _index) public payable {
        require(
            IERC20Token(cUsdTokenAddress).transferFrom(
                msg.sender,
                schoolAddress,
                students[_index].tuitionFee
            ),
            "Transfer failed."
        );
    }

       function getTuitionStatus(uint _index) public view returns (bool)  {
         if(students[_index].tuitionDate < block.timestamp){
            //  user has not paid
             return false;
         }else{
            //  user has paid
             return true;
         }
       

    }

    function getStudentLength() public view returns (uint256) {
        return (studentsLength);
    }
}

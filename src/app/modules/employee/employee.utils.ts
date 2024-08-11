import { Employee } from "./employee.model";

 

const findLastEmployeeId = async () => {
    const lastEmployee = await Employee.findOne(
      {},
      {
        employeeId: 1,
      }
    )
      .sort({ createdAt: -1 })
      .lean();
  
    return lastEmployee?.employeeId
      ? lastEmployee?.employeeId.substring(2)
      : undefined;
  };
  
  export const generateEmployeeId = async () => {
    const currentId = (await findLastEmployeeId()) || "0000";
    let incrementId = (Number(currentId) + 1).toString().padStart(4, "0");
    incrementId = `E:${incrementId}`;
    return incrementId;
  };

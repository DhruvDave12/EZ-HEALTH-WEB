const doctor = document.querySelector("#doctor");
const patient = document.querySelector("#patient");

const docform = document.querySelector("#doctorForm");
const patientform = document.querySelector("#patientForm");

docform.style.display= "none"; 
patientform.style.display= "none";

doctor.addEventListener('click',()=>{
    
    docform.style.display= "none";
    patientform.style.display= "block";
    patient.disabled = true;

})

patient.addEventListener('click',()=>{
    
    patientform.style.display= "none";    
    docform.style.display= "block";   
    doctor.disabled = true; 
})
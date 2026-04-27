function submitQuiz(){

let ans=document.getElementById("quizAnswer").value;

if(ans==="Regular Saving"){
document.getElementById("quizResult").innerHTML=
"<div class='success-box'>Correct! Badge Unlocked 🏆</div>";
}else{
document.getElementById("quizResult").innerHTML=
"<div class='error-box'>Incorrect. Try Again.</div>";
}

}
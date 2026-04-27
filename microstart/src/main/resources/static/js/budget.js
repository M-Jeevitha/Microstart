function calcBudget(){

let income=parseFloat(document.getElementById("income").value)||0;
let expense=parseFloat(document.getElementById("expense").value)||0;

let save=income-expense;

document.getElementById("resultBox").innerHTML=`
<div class="stat-card" style="margin-top:20px;">
<span>Estimated Savings</span>
<h2>₹${save}</h2>
<small class="${save>=0?'green':'red'}">
${save>=0?'Good Financial Health':'Overspending Alert'}
</small>
</div>
`;
}
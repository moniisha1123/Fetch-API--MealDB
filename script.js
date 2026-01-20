const baseURL = "https://www.themealdb.com/api/json/v1/1/";

// DOM Elements
const mealResults = document.getElementById("mealResults");
const searchNameInput = document.getElementById("searchName");
const searchLetterInput = document.getElementById("searchLetter");
const btnSearchName = document.getElementById("btnSearchName");
const btnSearchLetter = document.getElementById("btnSearchLetter");

// Search by Name
btnSearchName.addEventListener("click", () => {
    const query = searchNameInput.value.trim();
    if(query) fetchMeals(`search.php?s=${query}`);
});

// Search by First Letter
btnSearchLetter.addEventListener("click", () => {
    const letter = searchLetterInput.value.trim();
    if(letter) fetchMeals(`search.php?f=${letter}`);
});

// Fetch generic API
function fetchMeals(endpoint) {
    fetch(baseURL + endpoint)
        .then(res => res.json())
        .then(data => displayMeals(data.meals))
        .catch(() => mealResults.innerHTML = "<p>No results found</p>");
}

// Display meals
function displayMeals(meals) {
    mealResults.innerHTML = ""; // reset

    if(!meals) {
        mealResults.innerHTML = "<p class='text-center'>No meals found</p>";
        return;
    }

    meals.forEach(meal => {
        const mealCard = document.createElement("div");
        mealCard.className = "col-sm-4 my-2";

        mealCard.innerHTML = `
            <div class="card h-100">
                <img src="${meal.strMealThumb}" class="card-img-top" alt="${meal.strMeal}">
                <div class="card-body">
                    <h5 class="card-title">${meal.strMeal}</h5>
                    <p><strong>Category:</strong> ${meal.strCategory}</p>
                    <p><strong>Area:</strong> ${meal.strArea}</p>
                    <button class="btn btn-sm btn-info" onclick="showDetails('${meal.idMeal}')">View Ingredients</button>
                </div>
            </div>
        `;

        mealResults.appendChild(mealCard);
    });
}

// Show detailed info
function showDetails(mealId) {
    fetch(baseURL + `lookup.php?i=${mealId}`)
        .then(res => res.json())
        .then(data => {
            const meal = data.meals[0];
            let detailHTML = `
                <h2>${meal.strMeal}</h2>
                <img src="${meal.strMealThumb}" class="img-fluid">
                <h4>Ingredients</h4>
                <ul>
            `;

            // List ingredients + measures
            for(let i = 1; i <= 20; i++) {
                if(meal[`strIngredient${i}`]) {
                    detailHTML += `<li>${meal[`strIngredient${i}`]} - ${meal[`strMeasure${i}`]}</li>`;
                }
            }
            detailHTML += "</ul>";

            mealResults.innerHTML = detailHTML;
        });
}

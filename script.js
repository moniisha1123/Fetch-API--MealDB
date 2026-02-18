const baseURL = "https://www.themealdb.com/api/json/v1/1/";

// DOM
const mealResults = document.getElementById("mealResults");
const searchName = document.getElementById("searchName");
const searchLetter = document.getElementById("searchLetter");
const searchIngredient = document.getElementById("searchIngredient");
const searchArea = document.getElementById("searchArea");

document.getElementById("btnSearchName").onclick = () => singleSearch("name");
document.getElementById("btnSearchLetter").onclick = () => singleSearch("letter");
document.getElementById("btnSearchIngredient").onclick = () => singleSearch("ingredient");
document.getElementById("btnSearchArea").onclick = () => singleSearch("area");
document.getElementById("btnSearchAll").onclick = combinedSearch;

// ================= SINGLE SEARCH =================
async function singleSearch(type) {
    mealResults.innerHTML = "";

    if (type === "name" && searchName.value) {
        const meals = await fetchMeals(`search.php?s=${searchName.value}`);
        displayMeals(meals);
    }

    if (type === "letter" && searchLetter.value) {
        const meals = await fetchMeals(`search.php?f=${searchLetter.value}`);
        displayMeals(meals);
    }

    if (type === "ingredient" && searchIngredient.value) {
        const meals = await fetchMealsByFilter(`filter.php?i=${searchIngredient.value}`);
        displayMeals(meals);
    }

    if (type === "area" && searchArea.value) {
        const meals = await fetchMealsByFilter(`filter.php?a=${searchArea.value}`);
        displayMeals(meals);
    }
}

// ================= COMBINED SEARCH =================
async function combinedSearch() {
    const name = searchName.value.trim().toLowerCase();
    const letter = searchLetter.value.trim().toLowerCase();
    const ingredient = searchIngredient.value.trim().toLowerCase();
    const area = searchArea.value.trim().toLowerCase();

    let meals = [];

    // Base fetch (priority: name → letter → ingredient → area)
    if (name) {
        meals = await fetchMeals(`search.php?s=${name}`);
    } else if (letter) {
        meals = await fetchMeals(`search.php?f=${letter}`);
    } else if (ingredient) {
        meals = await fetchMealsByFilter(`filter.php?i=${ingredient}`);
    } else if (area) {
        meals = await fetchMealsByFilter(`filter.php?a=${area}`);
    } else {
        mealResults.innerHTML = "<p class='text-center'>Fill at least one field</p>";
        return;
    }

    // Apply remaining filters
    const filtered = meals.filter(meal => {

        const matchName = name ? meal.strMeal.toLowerCase().includes(name) : true;
        const matchArea = area ? meal.strArea?.toLowerCase() === area : true;
        const matchLetter = letter ? meal.strMeal[0].toLowerCase() === letter : true;

        let matchIngredient = true;
        if (ingredient) {
            matchIngredient = false;
            for (let i = 1; i <= 20; i++) {
                if (
                    meal[`strIngredient${i}`] &&
                    meal[`strIngredient${i}`].toLowerCase().includes(ingredient)
                ) {
                    matchIngredient = true;
                    break;
                }
            }
        }

        return matchName && matchArea && matchIngredient && matchLetter;
    });

    displayMeals(filtered);
}

// ================= FETCH =================
async function fetchMeals(endpoint) {
    const res = await fetch(baseURL + endpoint);
    const data = await res.json();
    return data.meals || [];
}

async function fetchMealsByFilter(endpoint) {
    const res = await fetch(baseURL + endpoint);
    const data = await res.json();
    if (!data.meals) return [];

    return Promise.all(
        data.meals.map(async m => {
            const r = await fetch(baseURL + `lookup.php?i=${m.idMeal}`);
            const d = await r.json();
            return d.meals[0];
        })
    );
}

// ================= DISPLAY =================
function displayMeals(meals) {
    mealResults.innerHTML = "";

    if (!meals || meals.length === 0) {
        mealResults.innerHTML = "<p class='text-center'>No meals found</p>";
        return;
    }

    meals.forEach(meal => {
        mealResults.innerHTML += `
            <div class="col-md-8 my-2">
                <div class="card h-100">
                    <img src="${meal.strMealThumb}" class="card-img-top">
                    <div class="card-body">
                        <h5>${meal.strMeal}</h5>
                        <p><strong>Area:</strong> ${meal.strArea}</p>
                        <button class="btn btn-sm btn-info" onclick="showDetails('${meal.idMeal}')">
                            View Ingredients
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
}

// ================= DETAILS =================
async function showDetails(id) {
    const res = await fetch(baseURL + `lookup.php?i=${id}`);
    const data = await res.json();
    const meal = data.meals[0];

    let html = `<h2>${meal.strMeal}</h2><ul>`;
    for (let i = 1; i <= 20; i++) {
        if (meal[`strIngredient${i}`]) {
            html += `<li>${meal[`strIngredient${i}`]} - ${meal[`strMeasure${i}`]}</li>`;
        }
    }
    html += "</ul>";
    mealResults.innerHTML = html;
}

import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/recipeView';
import {elements, renderLoader, clearLoader} from './views/base';


/** Global state of the app
 * - Search object
 * - Current recipe object
 * - Shopping list object
 * - Liked recipes
 */
const state = {};

/* 
          SEARCH CONTROLER
 */

const controlSearch = async () => {
     // 1) Get query from the view
     const query = searchView.getInput();


     if (query) {
          // 2) New search object and add to state
          state.search = new Search(query);

          // 3) Prepare UI for results
          searchView.clearInput();
          searchView.clearResults();
          renderLoader(elements.searchRes);

          try {
               // 4) Search for recipes
          await state.search.getResults();

          // 5) Render results on UI 
          clearLoader();
          searchView.renderResults(state.search.result);
          
          } catch (err) {
               alert('Ooops, something went wrong! Please try again later! ');
               clearLoader();
          }
     }
}

elements.searchForm.addEventListener('submit', e => {
     e.preventDefault();
     controlSearch();
});


elements.searchResPages.addEventListener('click', e => {
     const btn = e.target.closest('.btn-inline');
     if (btn) {
          const goToPage = parseInt(btn.dataset.goto, 10);
          searchView.clearResults();
          searchView.renderResults(state.search.result, goToPage);
          }
});
 
/* 
          RECIPE CONTROLER
 */

const controlRecipe = async () => {
     // Get ID from URL
     const id = window.location.hash.replace('#', '');
     console.log(id);

     if (id) {
          // Prepare UI for changes
          recipeView.clearRecipe();
          renderLoader(elements.recipe);
          

          // Highlight selected search item
          if (state.search) searchView.highlightSelected(id);

          // Create neew recipe object
          state.recipe = new Recipe (id);
          


          try {
               // Get recipe data and parse ingridients
          await state.recipe.getRecipe();
          state.recipe.parseIngredients();

          // Calculate servings and time 
          state.recipe.calcTime();
          state.recipe.calcServings();

          // Render the recipe 
          clearLoader();
          recipeView.renderRecipe(state.recipe);
          } catch (err) {
               alert('Error processing recipe!');
          };
          
          
          
     }
};

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));




/* 
******************* LIST CONTROLER
*/

const controlList = () => {
      // Create a new list IF there in none yet
      if (!state.list) state.list = new List();

      // Add each ingredient to the list and UI
      state.recipe.ingredients.forEach(el => {
          const item = state.list.addItem(el.count, el.unit, el.ingredient);
          listView.renderItem(item);
      });
}

// Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
     if (e.target.matches('.btn-decrease, .btn-decrease *')) {
          // Decrease button is clicked
          if (state.recipe.servings > 1) {
               state.recipe.updateServings('dec');
               recipeView.updateServingsIngredients(state.recipe);
          }
          
     } else if (e.target.matches('.btn-increase, .btn-increase *')) {
          // Increase button is clicked
          state.recipe.updateServings('inc');
          recipeView.updateServingsIngredients(state.recipe);
     } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add * ')) {
          controlList();
     }
});



window.l = new List();

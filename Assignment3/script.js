const APIKEY = '1fb1910a726f7a9cce1d3efa4ae25779';
const MOVIE_URL = `https://api.themoviedb.org/3/search/movie?api_key=${APIKEY}&query=`;
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500/';
var currentMovie = 'Titanic';
var currentId;
var body = document.body;
var usedMovie = [];
var counter = 0;

function init(){
    fetchMovie(currentMovie).then(data => {
        var movieConf = {
            title: data.results[0].original_title,
            releaseDate: data.results[0].release_date,
            image: IMAGE_URL + data.results[0].backdrop_path
        }
        addMovieInfo(movieConf);
        addPersonForm();
        //counter++;
        usedMovie.push(currentMovie);
    });
}

// ----- HTTP request functions start -----

function fetchMovie(movieName){
    var url = MOVIE_URL + movieName;
    return new Promise((resolve, reject) => {
        fetch(url).then((res) => {
            return res.json()
        }).then(data => {
            resolve(data)
        }).catch((error) => {
            reject(error)
        })
    })
}

function fetchPerson(movieId){
    var url = `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${APIKEY}`;
    return new Promise((resolve, reject) => {
        fetch(url).then((res) => {
            return res.json()
        }).then(data => {
            resolve(data)
        }).catch((error) => {
            reject(error)
        })
    })
}

// ----- HTTP request functions end -----

// ----- submit validation functions start -----

function submitPerson(counter){
    var input = document.getElementById('answer_person' + counter);
    var answerPerson = input.value.trim();
    fetchMovie(currentMovie).then(data => {
        var movieArr = data.results;
        for(var i of movieArr){
            if(i.original_title.toLowerCase() == currentMovie.toLowerCase()){
                currentId = i.id;
                break;
            }
        }
        fetchPerson(currentId).then(data => {
            //console.log(data);
            var directorInfo = checkDirector(data.crew, answerPerson);
            if(directorInfo !== undefined){
                var personConf = {
                    name: directorInfo.original_name,
                    image: IMAGE_URL + directorInfo.profile_path
                }
                addPersonInfo(personConf);
                addMovieForm();
            } else {
                var actorInfo = checkActor(data.cast, answerPerson);
                if(actorInfo !== undefined){
                    //console.log(actorInfo)
                    var personConf = {
                        name: actorInfo.original_name,
                        image: IMAGE_URL + actorInfo.profile_path
                    }
                    addPersonInfo(personConf);
                    addMovieForm();
                } else {
                    window.alert('wrong answer');
                }
            }
        })
    })
}

//director: James Cameron
function checkDirector(crewlist, name){
    for(var crew of crewlist){
        if(crew.job == 'Director'){
            directorName = crew.name;
            if(directorName.toLowerCase() == name.toLowerCase()){
                return crew;
            }
        }
    }
    // return false;
}

//actor: Leonardo DiCaprio, Kate Winslet
function checkActor(castlist, name){
    for(var cast of castlist){
        if(cast.name.toLowerCase() == name.toLowerCase()){
            return cast;
        }
    }
    // return false;
}

function checkUsedMovie(movieName){
    var used = false;
    for(var i of usedMovie){
        if (i.toLowerCase() == movieName.toLowerCase()){
            used = true;
            break;
        }
    }
    return used;
}

function submitMovie(counter){
    var input = document.getElementById('answer_movie' + counter);
    var answerMovie = input.value.trim();
    //console.log(document.getElementById('answer_person' + counter))
    var personName = document.getElementById('answer_person' + counter).value;
    //console.log('check used movie: ',checkUsedMovie(answerMovie));
    if(checkUsedMovie(answerMovie)){
        window.alert('Movie already entered, please try different movie');
        //console.log('movie name already used');
    } else {
        fetchMovie(answerMovie).then(data => {
            //console.log(data);
            var movieConf = {
                title: data.results[0].original_title,
                releaseDate: data.results[0].release_date,
                image: IMAGE_URL + data.results[0].backdrop_path
            }
            var movieArr = data.results;
            var answerMovieId;
            for(var i of movieArr){
                if(i.original_title.toLowerCase() == answerMovie.toLowerCase()){
                    answerMovieId = i.id;
                    break;
                }
            }
            //console.log('answerMovieId', answerMovieId)
            fetchPerson(answerMovieId).then(data => {
                console.log('crew and cast: ' , data);
                if(data.crew == undefined){
                    window.alert('wrong answer');
                    return;
                }
                var directorInfo = checkDirector(data.crew, personName);
                if(directorInfo !== undefined){
                    counter++;
                    addMovieInfo(movieConf);
                    addPersonForm();
                    usedMovie.push(answerMovie);
                    currentMovie = movieConf.title;
                } else {
                    var actorInfo = checkActor(data.cast, personName);
                    if(actorInfo !== undefined){
                        counter++;
                        addMovieInfo(movieConf);
                        addPersonForm();
                        usedMovie.push(answerMovie);
                        currentMovie = movieConf.title;
                    } else {
                        window.alert('wrong answer');
                    }
                }
            })
        })
    }
}

// ----- submit validation functions end -----

// ----- add page structure functions start -----

function addMovieInfo(conf){
    var movieDiv = document.createElement('div');
    movieDiv.id = 'movie_info' + counter;
    movieDiv.innerHTML = `
        <p>
            <span>Movie Title : </span>${conf.title}<br/>
            <span>Released date : </span>${conf.releaseDate}
        </p>
        <img src="${conf.image}" alt="poster">
    `;
    body.appendChild(movieDiv);
}

function addPersonInfo(conf){
    console.log(conf);
    var personDiv = document.createElement('div');
    personDiv.id = 'person_info' + counter;
    personDiv.innerHTML = `
        <p>
            <span>Name : </span>${conf.name}<br/>
        </p>
        <img src="${conf.image}" alt="photo">
    `;
    body.appendChild(personDiv);
}

function addMovieForm(){
    var movieFormDiv = document.createElement('div');
    movieFormDiv.id = 'movie_form' + counter;
    movieFormDiv.className = 'quiz_form'
    movieFormDiv.innerHTML =`
        <label for="answer_movie${counter}">Enter his / her movie name : </label>
        <span><input class="" id="answer_movie${counter}" type="text" placeholder="Enter movie name"></span>
        <button class="form_div" id="submit_movie${counter}" onclick="submitMovie(${counter})">Submit</button>
        <span class="error_message"></span>
    `;
    body.appendChild(movieFormDiv);
    var input = document.getElementById('answer_movie'+counter);
    input.focus();
    input.addEventListener('keydown', function(e){
        e = e || window.event;
        if(e.keyCode == 13){
            e.preventDefault();
            submitMovie(counter);
        }
    })
    if(document.getElementById('answer_person'+counter-1) !== null){
        document.getElementById('answer_person'+counter-1).disabled = true;
    }
}

function addPersonForm(){
    var personFormDiv = document.createElement('div');
    personFormDiv.id = 'person_form' + counter;
    personFormDiv.className = 'quiz_form'
    personFormDiv.innerHTML =`
        <label for="answer_person${counter}">Enter director / actor name : </label>
        <span><input class="" id="answer_person${counter}" type="text" placeholder="Enter full name"></span>
        <button class="form_div" id="submit_person${counter}" onclick="submitPerson(${counter})">Submit</button>
        <span class="error_message"></span>
    `;
    body.appendChild(personFormDiv);

    var input = document.getElementById('answer_person'+counter);
    input.focus();
    input.addEventListener('keydown', function(e){
        e = e || window.event;
        if(e.keyCode == 13){
            e.preventDefault();
            submitPerson(counter);
        }
    })
    if(document.getElementById('answer_movie'+counter) !== null){
        document.getElementById('answer_movie'+counter).disabled = true;
    }
}

// ----- add page structure functions end -----

addEventListener('load', function(){
    init();
});


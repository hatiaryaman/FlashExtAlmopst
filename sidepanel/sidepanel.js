var add = document.getElementById("add")
var search = document.getElementById("search")
var close1 = document.getElementById("close1")
var close2 = document.getElementById("close2")
var bottom = document.getElementsByClassName("bottom")[0]
var bottombuttons = document.getElementsByClassName("bottom-buttons")[0]
var bottominputs1 = document.getElementsByClassName("bottom-inputs1")[0]
var bottominputs2 = document.getElementsByClassName("bottom-inputs2")[0]
var setscontainer = document.getElementsByClassName("sets-container")[0]
var tooltips = document.getElementsByClassName("tooltips")[0]
var searching = document.getElementsByTagName("input")[0]
var adding = document.getElementById("naming")
var settings = document.getElementById("settings")
//let ericLi = document.

// Checking sets in local storage
var sets = []


var editState = false
var editSet = null

settings.addEventListener("click", function(){
    editState = !editState

    if (editState){
        for (let button of sets){
            button.style.backgroundColor = "#003cac"
        }
    } else{
        for (let button of sets){
            button.style.backgroundColor = "#051336"
        }
    }
})

chrome.storage.local.get(['userLocal'], async function (result) {
    let user = result.userLocal;
    for (let set of user.sets) {
        if (set != "") {
            let newbutton = document.createElement("button")
            newbutton.setAttribute("class", "set")
            newbutton.innerHTML = set
            setscontainer.appendChild(newbutton)
            adding.value = ""

            newbutton.addEventListener("click", async () => {
                if (!editState) {
                    let time = "300ms"

                    for (let e of document.body.querySelectorAll("*")) {
                        e.style.animationName = "fadeout";
                        e.style.animationDuration = time;

                        e.style.visibility = "hidden"
                    }

                    await new Promise(resolve => setTimeout(resolve, 250));

                    await switch_panels(newbutton.innerHTML);

                    await chrome.sidePanel.setOptions({ path: `setpanel/setpanel.html` })
                } else{
                    if (editSet != newbutton){
                        editSet = newbutton
                        newbutton.style.backgroundColor = "#051336"
                        edit()
                    } else {
                        editSet = null
                        newbutton.style.backgroundColor = "#003cac"
                        closeEdit()
                    }
                }
            })

            sets.push(newbutton)
        }
    }

    setUp()
});

function edit() {
    add.style.animationName = "grow, fadeout"
    add.style.animationDuration = "500ms"
    add.style.visibility = "hidden"

    search.style.animationName = "shrink, fadeout"
    search.style.animationDuration = "500ms"
    search.style.visibility = "hidden"

    close2.style.animationName = "shrink, fadein"
    close2.style.animationDuration = "500ms"
    close2.style.visibility = "visible"
    let trash = document.createElement("img")
    trash.setAttribute("id","trash")
    trash.setAttribute("src","delete.png")
    close2.replaceChildren(trash)

    adding.style.animationName = "grow, fadein"
    adding.style.animationDuration = "500ms"
    adding.style.visibility = "visible"
    adding.setAttribute("placeholder", "New name")

    bottom.removeChild(bottominputs2)
    bottom.appendChild(bottominputs2)

    adding.focus()
}

function closeEdit(){
    add.style.animationName = "shrink,fadein"
    add.style.animationDuration = "500ms"
    add.style.visibility = "visible"

    search.style.animationName = "grow, fadein"
    search.style.animationDuration = "500ms"
    search.style.visibility = "visible"

    close2.style.animationName = "grow, fadeout"
    close2.style.animationDuration = "500ms"
    close2.style.visibility = "hidden"
    let close = document.createElement("img")
    close.setAttribute("id","X-image")
    close.setAttribute("src","X.webp")
    close2.replaceChildren(close)

    adding.style.animationName = "shrink, fadeout"
    adding.style.animationDuration = "500ms"
    adding.style.visibility = "hidden"
    adding.setAttribute("placeholder", "Set name")

    bottom.removeChild(bottombuttons)
    bottom.appendChild(bottombuttons)
}

function setUp() {
    chrome.storage.local.get(['userLocal'], async function (result) {
        let user = result.userLocal;

        console.log(user.panel)
        if (user.panel == "main") {

            for (let e of document.body.querySelectorAll("*")) {
                e.style.animationName = "fadein";
                e.style.animationDuration = "300ms";
            }
        }
    });
}

async function switch_panels(set) {
    await chrome.storage.local.get(['userLocal'], async function (result) {
        let user = result.userLocal;
        user.set = set
        user.panel = "set"
        await chrome.storage.local.set({ userLocal: user }, function () { });
    });
}

async function updateSets(set) {
    await chrome.storage.local.get(['userLocal'], async function (result) {
        let user = result.userLocal;
        user.sets.push(set)
        user.flashcards[set] = []
        console.log(user.sets)
        console.log(user.flashcards)
        await chrome.storage.local.set({ userLocal: user }, function () { });
    });
}

async function addSet(name) {
    if (name != "") {
        var newbutton = document.createElement("button")
        newbutton.setAttribute("class", "set")
        newbutton.innerHTML = name
        setscontainer.appendChild(newbutton)
        adding.value = ""

        await updateSets(name)

        newbutton.addEventListener("click", async () => {
            if (!editState){
                await switch_panels(newbutton.innerHTML);

                for (let e of document.body.querySelectorAll("*")) {
                    e.style.animationName = "fadeout";
                    e.style.animationDuration = "300ms";

                    e.style.visibility = "hidden"
                }

                await new Promise(resolve => setTimeout(resolve, 250));

                await chrome.sidePanel.setOptions({ path: `setpanel/setpanel.html` })

            }else{
                if (editSet != newbutton){
                    editSet = newbutton
                    newbutton.style.backgroundColor = "#051336"
                    edit()
                } else {
                    editSet = null
                    newbutton.style.backgroundColor = "#003cac"
                    closeEdit()
                }
            }
        })

        sets.push(newbutton)
    }
}

const levenshteinDistance = (str1 = '', str2 = '') => {
    str1 = str1.toLowerCase()
    str2 = str2.toLowerCase()
    const track = Array(str2.length + 1).fill(null).map(() =>
        Array(str1.length + 1).fill(null));
    for (let i = 0; i <= str1.length; i += 1) {
        track[0][i] = i;
    }
    for (let j = 0; j <= str2.length; j += 1) {
        track[j][0] = j;
    }
    for (let j = 1; j <= str2.length; j += 1) {
        for (let i = 1; i <= str1.length; i += 1) {
            const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
            track[j][i] = Math.min(
                track[j][i - 1] + 1, // deletion
                track[j - 1][i] + 1, // insertion
                track[j - 1][i - 1] + indicator, // substitution
            );
        }
    }
    return track[str2.length][str1.length];
};

function wordDist(wa, wb) {
    if (wa.length == 0) return wb.length;
    if (wb.length == 0) return wa.length;

    let arr = new Array(wb.length);
    for (let i = 0; i < wb.length; i++) {
        arr[i] = new Array(wa.length);
        for (let j = 0; j < wa.length; j++) {
            let l = (j == 0) ? i + 1 : arr[i][j - 1];
            let u = (i == 0) ? j + 1 : arr[i - 1][j];
            let ul = (i == 0) ? j : ((j == 0) ? i : arr[i - 1][j - 1]);

            let subCost = 0;
            if (wa[j] != wb[i]) subCost++;

            arr[i][j] = Math.min(l + 1, u + 1, ul + subCost);
        }
    }
    return arr[wb.length - 1][wa.length - 1];
}

function phraseDist(a, b) {
    a = a.toLowerCase().split(" ");
    b = b.toLowerCase().split(" ");

    let arr = new Array(b.length + 1);
    arr[0] = new Array(a.length + 1);
    arr[0][0] = 0;
    let c = 0;
    for (let j = 0; j < a.length; j++) {
        c += a[j].length;
        arr[0][j + 1] = c;
    }
    c = 0;
    for (let i = 0; i < b.length; i++) {
        arr[i + 1] = new Array(a.length + 1);
        c += b[i].length;
        arr[i + 1][0] = 0;
    }

    for (let i = 0; i < b.length; i++) {
        for (let j = 0; j < a.length; j++) {
            let cost = wordDist(a[j], b[i]);

            let l = arr[i][j + 1];
            let u = arr[i + 1][j] + a[j].length;
            let ul = arr[i][j] + 2 * cost;
            arr[i + 1][j + 1] = Math.min(l, u, ul);
        }
    }
    return arr[b.length][a.length];
}

add.onclick = function () {
    add.style.animationName = "grow, fadeout"
    add.style.animationDuration = "500ms"
    add.style.visibility = "hidden"

    search.style.animationName = "shrink, fadeout"
    search.style.animationDuration = "500ms"
    search.style.visibility = "hidden"

    close2.style.animationName = "shrink, fadein"
    close2.style.animationDuration = "500ms"
    close2.style.visibility = "visible"

    adding.style.animationName = "grow, fadein"
    adding.style.animationDuration = "500ms"
    adding.style.visibility = "visible"

    bottom.removeChild(bottominputs2)
    bottom.appendChild(bottominputs2)

    adding.focus()
}

close1.onclick = function () {
    add.style.animationName = "shrink,fadein"
    add.style.animationDuration = "500ms"
    add.style.visibility = "visible"

    search.style.animationName = "grow, fadein"
    search.style.animationDuration = "500ms"
    search.style.visibility = "visible"

    close1.style.animationName = "grow, fadeout"
    close1.style.animationDuration = "500ms"
    close1.style.visibility = "hidden"

    searching.style.animationName = "shrink, fadeout"
    searching.style.animationDuration = "500ms"
    searching.innerHTML = ""
    searching.style.visibility = "hidden"

    bottom.removeChild(bottombuttons)
    bottom.appendChild(bottombuttons)
}

close2.onclick = function () {
    if (!editState) {
        add.style.animationName = "shrink,fadein"
        add.style.animationDuration = "500ms"
        add.style.visibility = "visible"

        search.style.animationName = "grow, fadein"
        search.style.animationDuration = "500ms"
        search.style.visibility = "visible"

        close2.style.animationName = "grow, fadeout"
        close2.style.animationDuration = "500ms"
        close2.style.visibility = "hidden"

        adding.style.animationName = "shrink, fadeout"
        adding.style.animationDuration = "500ms"
        adding.style.visibility = "hidden"
        adding.innerHTML = ""

        bottom.removeChild(bottombuttons)
        bottom.appendChild(bottombuttons)
    } else{
        chrome.storage.local.get(['userLocal'], async function (result) {
            let user = result.userLocal;
            
            for (let i = 0; i<user.sets.length; i++){
                if (user.sets[i] = editSet.innerHTML){
                    user.sets.splice(i,1)
                    break
                }
            }

            let cards = user.flashcards[editSet.innerHTML]
            delete user.flashcards[editSet.innerHTML]
            
            for (let card of cards){
                delete user.definitions[card]
            }

            console.log(user)
            await chrome.storage.local.set({userLocal: user}, function () {});
        });

        for (let i; i < sets.length; i++){
            if (sets[i].innerHTML == editSet.innerHTML){
                delete sets[i]
                break
            }
        }

        setscontainer.removeChild(editSet)
        console.log(sets)
        console.log(setscontainer)

        closeEdit()

        //for (let i = 0; i < )
    }
}

search.onclick = function () {
    add.style.animationName = "grow,fadeout"
    add.style.animationDuration = "500ms"
    add.style.visibility = "hidden"

    search.style.animationName = "shrink, fadeout"
    search.style.animationDuration = "500ms"
    search.style.visibility = "hidden"

    close1.style.animationName = "shrink, fadein"
    close1.style.animationDuration = "500ms"
    close1.style.visibility = "visible"

    searching.style.animationName = "grow, fadein"
    searching.style.animationDuration = "500ms"
    searching.style.visibility = "visible"

    bottom.removeChild(bottominputs1)
    bottom.appendChild(bottominputs1)

    searching.focus()
}

adding.addEventListener("keydown", async (e) => {
    let match = false
    for (let set of sets){
        if (set.innerHTML == adding.value){
            match = true
        }
    }

    if (!match){
        if (!editState){
            if (e.key == "Enter") {
                addSet(adding.value)
            }
        } else{
            if (e.key == "Enter") {
                chrome.storage.local.get(['userLocal'], async function (result) {
                    let user = result.userLocal;
                    user.flashcards[adding.value] = [...user.flashcards[editSet.innerHTML]]
                    delete user.flashcards[editSet.innerHTML]

                    for (let i = 0; i < user.sets.length; i++){
                        if (user.sets[i] == editSet.innerHTML){
                            user.sets[i] = adding.value
                            break
                        }
                    }

                    console.log(user.sets)
                    console.log(user.flashcards)
                    editSet.innerHTML = adding.value

                    await chrome.storage.local.set({userLocal: user}, function () {});
                });

            }
        }
    } else{
        adding.style.animation = "horizontal-shaking"
        adding.style.animationDuration = "200ms"
        await new Promise(resolve => setTimeout(resolve, 250));

        adding.style.animation = null
        adding.value = ""
    }
})

searching.addEventListener('input', (e) => {
    query = searching.value

    let dists = sets.map((set) => phraseDist(query, set.innerHTML));
    let minDist = Math.min(...dists);

    for (let i = 0; i < sets.length; i++) {
        let set = sets[i];
        if (dists[i] <= minDist + 3) {
            set.style.opacity = 1
        } else {
            if (query == "") {
                set.style.opacity = 1
            } else {
                set.style.opacity = 0.2
            }
        }
    }
})
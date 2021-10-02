"use strict";
window.addEventListener("DOMContentLoaded", start);

const StudentPro = {
  firstName: "",
  middleName: "",
  lastName: "",
  nickName: "",
  house: "",
  expelled: false,
  blood: "",
  squad: false,
  prefect: false,
};

const allStudents = [];
let readyStudents = allStudents;
let expelledStudents = [];
let squadedStudents = [];
let prefectedStudents = [];

let filter = "All houses";
let sort = "";
let sortDirection = "asc";
let alreadyHacked = false;

function start() {
  loadJSON();
  document.querySelectorAll("[data-action='filter']").forEach((p) => p.addEventListener("click", filterClicked));
  document.querySelectorAll("[data-action='sort']").forEach((p) => p.addEventListener("click", sortClicked));
  document.querySelectorAll("button.buttonHasDropdown").forEach((button) =>
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      button.nextElementSibling.classList.toggle("hidden");
      window.addEventListener("click", (e) => {
        button.nextElementSibling.classList.add("hidden");
      });
    })
  );

  document.querySelector("#expelledButton").addEventListener("click", showExpelledStudents);
  document.querySelector("#squadedButton").addEventListener("click", showSquadedStudents);
  document.querySelector("#prefectedButton").addEventListener("click", showPrefectedStudents);
  document.querySelector("#search input").addEventListener("input", searchClicked);
  document.querySelector("#hackTheSystem").addEventListener("click", hackTheSystem);
}

async function loadJSON() {
  const resStudent = await fetch("https://petlatkea.dk/2021/hogwarts/students.json");
  const studentData = await resStudent.json();
  const resBlood = await fetch("https://petlatkea.dk/2021/hogwarts/families.json");
  const bloodData = await resBlood.json();
  prepareStudents(studentData, bloodData);
}

// Creating new array with cleaned Student data

function prepareStudents(studentData, bloodData) {
  studentData.forEach((obj) => {
    const studentPro = Object.create(StudentPro);

    // Dividing fullname into parts

    const fullName = obj.fullname.trim();
    const house = capitalize(obj.house.trim());

    let firstName = capitalize(fullName.substring(0, fullName.indexOf(" ")));
    let middleName = capitalize(fullName.substring(fullName.indexOf(" ") + 1, fullName.lastIndexOf(" ")));
    let lastName = capitalize(fullName.substring(fullName.lastIndexOf(" ") + 1));
    let nickName = "";
    let blood;

    // Fixing unusual situations: Leanne, Ernie, Finch-Fletchley

    if (fullName.includes(" ") === false) {
      firstName = capitalize(fullName.substring(0));
      lastName = "";
    }
    if (middleName.includes('"')) {
      nickName = capitalize(middleName.substring(1, middleName.length - 1));
      middleName = "";
    }
    if (lastName.includes("-")) {
      lastName = lastName.split("-")[0] + "-" + capitalize(lastName.split("-")[1]);
    }

    // Finding blood status

    if (lastName === "") {
      blood = "unknown";
    } else if (bloodData.half.includes(lastName)) {
      blood = "half";
    } else if (bloodData.pure.includes(lastName)) {
      blood = "pure";
    } else {
      blood = "muggle";
    }

    // Populating created object with data

    studentPro.firstName = firstName;
    studentPro.middleName = middleName;
    studentPro.nickName = nickName;
    studentPro.lastName = lastName;
    studentPro.house = house;
    studentPro.blood = capitalize(blood);
    allStudents.push(studentPro);
  });

  displayList(allStudents);
}

// Capitalize function

function capitalize(str) {
  const capStr = str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
  return capStr;
}

// Filtering

function filterClicked(event) {
  filter = event.target.dataset.filter;
  document.querySelector("#filter span").textContent = filter;
  buildList(filter);
}

function filterStudents(filteredStudents) {
  if (document.querySelector("#filter span").textContent !== "Filter ") {
    filteredStudents = allStudents.filter(filtered);

    function filtered(student) {
      if (student.house === filter && student.expelled === false) {
        return true;
      } else if (filter === "All houses" && student.expelled === false) {
        return true;
      } else {
        return false;
      }
    }
  }

  return filteredStudents;
}

// Sorting

function sortClicked(event) {
  sort = event.target.dataset.sort;

  // Use camelCase for hyphens in data attributes. sort-direction = sortDirection

  sortDirection = event.target.dataset.sortDirection;

  if (sortDirection === "asc") {
    event.target.dataset.sortDirection = "desc";
    document.querySelector("#sort span").textContent = `${capitalize(sort)} ( A - Z )`;
  } else {
    event.target.dataset.sortDirection = "asc";
    document.querySelector("#sort span").textContent = `${capitalize(sort)} ( Z - A )`;
  }

  buildList(sort, sortDirection);
}

function sortStudents(sortedStudents) {
  let direction = 1;

  if (sortDirection === "desc") {
    direction = -1;
  }

  sortedStudents = sortedStudents.sort(sorted);

  function sorted(a, b) {
    if (a[sort] < b[sort]) {
      return -1 * direction;
    } else {
      return 1 * direction;
    }
  }

  return sortedStudents;
}

// Build list

function buildList() {
  document.querySelector("input").value = "";
  const currentStudents = filterStudents(readyStudents);
  readyStudents = sortStudents(currentStudents);
  displayList(readyStudents);
}

// Searching

function searchClicked(event) {
  const input = event.target.value;

  const searchStudents = readyStudents.filter((student) => {
    const fullStudentName = `${student.firstName} ${student.middleName} ${student.nickName} ${student.lastName}`;

    if (fullStudentName.toLowerCase().includes(input.toLowerCase())) {
      return true;
    } else {
      return false;
    }
  });

  displayList(searchStudents);

  document.querySelector("h3").textContent = `The list has ${searchStudents.length} students`;

  if (searchStudents.length === 1) {
    document.querySelector("h3").textContent = `The list has 1 student`;
  }

  if (searchStudents.length === 0) {
    document.querySelector("h3").textContent = `No match`;
  }
}

function displayList(all) {
  document.querySelector("#studentList").innerHTML = "";

  document.querySelector("h3").textContent = `The list has ${readyStudents.length} students`;

  if (readyStudents.length === 1) {
    document.querySelector("h3").textContent = `The list has 1 student`;
  }

  if (readyStudents.length === 0) {
    document.querySelector("h3").textContent = `The list is empty`;
  }

  all.forEach(displayStudentList);
}

// Display student list function

function displayStudentList(student) {
  const clone = document.querySelector("#studentTemplate").content.cloneNode(true);
  const photo = clone.querySelector("[data-field=photo] img");

  // Fixing images for Leanne, Patil, Finch-Fletchley

  if (student.firstName === "Leanne") {
    photo.src = `images/empty.png`;
  } else if (student.lastName === "Patil") {
    photo.src = `images/${student.lastName.toLowerCase()}_${student.firstName.toLowerCase()}.png`;
  } else if (student.lastName.includes("-")) {
    photo.src = `images/${student.lastName.split("-")[1].toLowerCase()}_${student.firstName.substring(0, 1).toLowerCase()}.png`;
  } else {
    photo.src = `images/${student.lastName.toLowerCase()}_${student.firstName.substring(0, 1).toLowerCase()}.png`;
  }

  clone.querySelector(
    "[data-field=firstname]"
  ).textContent = `${student.firstName} ${student.middleName} ${student.nickName} ${student.lastName}`;

  clone.querySelector("[data-field=house] img").src = `images/${student.house}_white.png`;
  clone.querySelector("[data-field=blood] img").src = `images/${student.blood}.svg`;

  if (student.prefect === true) {
    clone.querySelector("[data-field=icons] img:nth-of-type(1)").classList.remove("hidden");
  } else {
    clone.querySelector("[data-field=icons] img:nth-of-type(1)").classList.add("hidden");
  }

  if (student.squad === true) {
    clone.querySelector("[data-field=icons] img:nth-of-type(2)").classList.remove("hidden");
  } else {
    clone.querySelector("[data-field=icons] img:nth-of-type(2)").classList.add("hidden");
  }

  clone.querySelector(".tableStudentList tr").addEventListener("click", preShowModal);

  function preShowModal() {
    document.querySelector(".overlay").classList.add("darken");
    document.querySelector("#hackTheSystem").classList.add("hidden");

    showModal(student);
  }

  // Append clone

  document.querySelector("#studentList").appendChild(clone);
}

// Show modal

function showModal(student) {
  const cloneModal = document.querySelector("#modalWrap").content.cloneNode(true);

  // Students photos

  const photo = cloneModal.querySelector(".modalLeftTop img");

  // Fixing images for Leanne, Patil, Finch-Fletchley

  if (student.firstName === "Leanne") {
    photo.src = `images/empty.png`;
  } else if (student.lastName === "Patil") {
    photo.src = `images/${student.lastName.toLowerCase()}_${student.firstName.toLowerCase()}.png`;
  } else if (student.lastName.includes("-")) {
    photo.src = `images/${student.lastName.split("-")[1].toLowerCase()}_${student.firstName.substring(0, 1).toLowerCase()}.png`;
  } else {
    photo.src = `images/${student.lastName.toLowerCase()}_${student.firstName.substring(0, 1).toLowerCase()}.png`;
  }

  cloneModal.querySelector(".modalDetails p:nth-of-type(1)").textContent = `First name: ${student.firstName}`;

  // (student.middleName === "") - Fixing Leanne

  if (student.middleName === " " || student.middleName === "") {
    cloneModal.querySelector(".modalDetails p:nth-of-type(2)").textContent = `Middle name: -`;
  } else {
    cloneModal.querySelector(".modalDetails p:nth-of-type(2)").textContent = `Middle name: ${student.middleName}`;
  }

  if (student.nickName === "") {
    cloneModal.querySelector(".modalDetails p:nth-of-type(3)").textContent = `Nickname: -`;
  } else {
    cloneModal.querySelector(".modalDetails p:nth-of-type(3)").textContent = `Nickname: ${student.nickName}`;
  }

  cloneModal.querySelector(".modalDetails p:nth-of-type(4)").textContent = `Lastname: ${student.lastName}`;

  cloneModal.querySelector(".modalLeftBottom p:nth-of-type(1)").textContent = `Blood status: ${student.blood}`;

  cloneModal.querySelector(".modalRight img").src = `images/${student.house}.png`;

  // Expell starts

  if (student.expelled === false) {
    cloneModal.querySelector(".modalLeftBottom p:nth-of-type(2)").textContent = `Is expelled: No`;

    cloneModal.querySelector(".buttonsModal button:nth-of-type(1)").addEventListener("click", expelClicked);

    function expelClicked() {
      this.removeEventListener("click", expelClicked);

      expelStudent(student);
    }
  } else {
    cloneModal.querySelector("#expelledRed").className = "expelledRed";
    cloneModal.querySelector(".modalLeftBottom p:nth-of-type(2)").textContent = `Is expelled: Yes`;
    cloneModal.querySelector(".modalLeftBottom p:nth-of-type(4)").textContent = "Inquisitorial squad member: No";
    cloneModal.querySelector(".modalLeftBottom p:nth-of-type(3)").textContent = "Has prefect: No";
  }

  function expelStudent(student) {
    if (student.firstName === "Hacker") {
      alertFromHacker();
      document.querySelector("#hackedModal p").textContent = "Hacker can't be expelled";
    } else {
      student.expelled = true;
      student.prefect = false;
      student.squad = false;

      const indexStudent = allStudents.findIndex((obj) => obj.firstName === student.firstName);
      allStudents.splice(indexStudent, 1);

      const indexStudent2 = prefectedStudents.findIndex((obj) => obj.firstName === student.firstName);
      prefectedStudents.splice(indexStudent2, 1);

      const indexStudent3 = squadedStudents.findIndex((obj) => obj.firstName === student.firstName);
      squadedStudents.splice(indexStudent3, 1);

      expelledStudents.push(student);

      buildList();
      showModal(student);
    }
  }

  // Squad starts

  if (student.squad === true) {
    cloneModal.querySelector(".buttonsModal button:nth-of-type(2)").textContent = "Remove from squad";
    cloneModal.querySelector(".modalLeftBottom p:nth-of-type(4)").textContent = "Inquisitorial squad member: Yes";
  } else if (student.squad === false) {
    cloneModal.querySelector(".buttonsModal button:nth-of-type(2)").textContent = "Add to squad";
    cloneModal.querySelector(".modalLeftBottom p:nth-of-type(4)").textContent = "Inquisitorial squad member: No";
  }

  cloneModal.querySelector(".buttonsModal button:nth-of-type(2)").addEventListener("click", squadStudent);

  function squadStudent() {
    tryMakeSquad(student);
  }

  function tryMakeSquad(student) {
    if (student.house === "Slytherin" || student.blood === "Pure") {
      makeSquad(student);
    } else {
      dontMakeSquad();
    }
  }

  function makeSquad(student) {
    if (student.squad === false) {
      student.squad = true;

      squadedStudents.push(student);
    } else {
      student.squad = false;

      const indexStudent = squadedStudents.findIndex((obj) => obj.firstName === student.firstName);
      squadedStudents.splice(indexStudent, 1);
    }

    buildList();
    showModal(student);
  }

  function dontMakeSquad() {
    alert();
    document.querySelector("#alertModal p:nth-of-type(2)").textContent =
      "You can only add students with pure blood or from Slytherin house to Inquisitorial Squad";
  }

  // Prefect starts

  if (student.prefect === true) {
    cloneModal.querySelector(".buttonsModal button:nth-of-type(3)").textContent = "Remove prefect";
    cloneModal.querySelector(".modalLeftBottom p:nth-of-type(3)").textContent = "Has prefect: Yes";
  } else {
    cloneModal.querySelector(".buttonsModal button:nth-of-type(3)").textContent = "Add prefect";
    cloneModal.querySelector(".modalLeftBottom p:nth-of-type(3)").textContent = "Has prefect: No";
  }

  cloneModal.querySelector(".buttonsModal button:nth-of-type(3)").addEventListener("click", prefectStudent);

  function prefectStudent() {
    tryMakePrefect(student);
  }

  function tryMakePrefect(student) {
    const allPrefects = allStudents.filter((obj) => obj.prefect);
    const fromOneHouse = allPrefects.filter((obj) => obj.house === student.house);
    const numberOfPrefectsFromOneHouse = fromOneHouse.length;

    if (student.prefect === false && numberOfPrefectsFromOneHouse < 2) {
      student.prefect = true;

      prefectedStudents.push(student);
    } else if (student.prefect === true) {
      student.prefect = false;

      const indexStudent = prefectedStudents.findIndex((obj) => obj.firstName === student.firstName);
      prefectedStudents.splice(indexStudent, 1);
    } else {
      dontMakePrefect();
    }

    buildList();
    showModal(student);
  }

  function dontMakePrefect() {
    alert();
    document.querySelector("#alertModal p:nth-of-type(2)").textContent = "Only two students from each house can be selected Prefects";
  }

  // removed "hidden" class here

  cloneModal.querySelector("#modal").className = `${student.house.toLowerCase()} modal`;

  cloneModal.querySelector(".crossModal").addEventListener("click", closeModalClicked);

  function closeModalClicked() {
    document.querySelectorAll("#modal").forEach((section) => section.classList.add("hidden"));

    document.querySelector(".overlay").classList.remove("darken");
    document.querySelector("#hackTheSystem").classList.remove("hidden");
  }

  document.querySelector("body").appendChild(cloneModal);
}

// Show expelled students

function showExpelledStudents() {
  document.querySelector("#filter span").textContent = "Filter ";

  document.querySelector("input").value = "";

  readyStudents = expelledStudents;
  displayList(readyStudents);
}

// Show students in Squad

function showSquadedStudents() {
  document.querySelector("#filter span").textContent = "Filter ";

  document.querySelector("input").value = "";

  if (squadedStudents.length < 1) {
    document.querySelector("h3").textContent = "Inquisitorial squad is empty";
  }

  readyStudents = squadedStudents;
  displayList(readyStudents);
}

// Show students with Prefect

function showPrefectedStudents() {
  document.querySelector("#filter span").textContent = "Filter ";

  document.querySelector("input").value = "";

  readyStudents = prefectedStudents;
  displayList(readyStudents);
}

// Hack the system

function hackTheSystem() {
  if (alreadyHacked === false) {
    alreadyHacked = true;

    document.querySelector("#slideOut").className = "slideOut";

    setTimeout(function () {
      document.querySelector("#slideOut").className = "hidden";
    }, 3500);

    setTimeout(function () {
      alertFromHacker();

      document.querySelector("#hackedModal p").textContent = "Hacker Anonymous is a new student at Hogwarts now";
    }, 4000);

    setTimeout(function () {
      alertFromHacker();

      document.querySelector("#hackedModal p").textContent = "Students' blood types were messed up";
    }, 7500);

    addMyself();
    messBlood();
    removeFromSquad();
  } else {
    alertFromHacker();

    document.querySelector("#hackedModal p").textContent = "The system has already been hacked";
  }

  buildList();
}

// Add myself

function addMyself() {
  const me = {
    firstName: "Hacker",
    middleName: "",
    lastName: "Anonymous",
    nickName: "",
    house: "Slytherin",
    expelled: false,
    blood: "Half",
    squad: false,
    prefect: false,
  };

  allStudents.unshift(me);
}

// Mess blood

function messBlood() {
  allStudents.forEach((student) => {
    if (student.blood === "Pure") {
      const randomNumber = Math.floor(Math.random() * 3) + 1;
      switch (randomNumber) {
        case 1:
          student.blood = "Pure";
          break;
        case 2:
          student.blood = "Half";
          break;
        case 3:
          student.blood = "Muggle";
          break;
      }
    } else {
      student.blood = "Pure";
    }
  });
}

// Remove all students from Squad

function removeFromSquad() {
  squadedStudents.forEach((obj) => {
    obj.squad = false;

    setTimeout(function () {
      alertFromHacker();

      document.querySelector("#hackedModal p").textContent = "All students were removed from Inquisitorial Squad";
    }, 11000);
  });

  squadedStudents = [];

  buildList();
}

function alert() {
  document.querySelector("#alertModal").classList.remove("hidden");
  document.querySelector(".overlay").classList.add("zIndex");

  document.querySelector("#alertModal p").addEventListener("click", (e) => {
    document.querySelector("#alertModal").classList.add("hidden");
    document.querySelector(".overlay").classList.remove("zIndex");
  });
}

function alertFromHacker() {
  document.querySelector("#hackedModal").classList.remove("hidden");
  document.querySelector(".overlay").classList.add("darken");

  setTimeout(function () {
    document.querySelector("#hackedModal").classList.add("hidden");
    document.querySelector(".overlay").classList.remove("darken");
  }, 3000);
}

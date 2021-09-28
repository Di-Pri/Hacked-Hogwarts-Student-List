"use strict";
window.addEventListener("DOMContentLoaded", start);

const StudentPro = {
  firstName: "",
  middleName: "",
  lastName: "",
  nickName: "",
  gender: "",
  house: "",
  expelled: false,
  blood: "",
  prefect: false,
  squad: false,
  prefect: false,
};

const allStudents = [];
let readyStudents = allStudents;
let expelledStudents = [];
let filteredandSortedSt = [];
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
  console.log("studentData", studentData, "bloodData", bloodData);

  studentData.forEach((obj) => {
    const studentPro = Object.create(StudentPro);

    // Dividing fullname into parts

    const fullName = obj.fullname.trim();
    const gender = obj.gender;
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
    studentPro.gender = gender;
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

  window.addEventListener("click", (e) => {
    document.querySelector("input").value = "";
  });

  document.querySelector("h3 span").textContent = searchStudents.length;
}

function displayList(all) {
  document.querySelector("#studentList").innerHTML = "";
  all.forEach(displayStudentList);
}

// Display student list function

function displayStudentList(student) {
  if (document.querySelector("input").value === "") {
    document.querySelector("h3 span").textContent = readyStudents.length;
  }

  const clone = document.querySelector("#studentTemplate").content.cloneNode(true);
  let photo = clone.querySelector(".studentPhoto");

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

  clone.querySelector("[data-field=house]").textContent = student.house;
  clone.querySelector("[data-field=blood]").textContent = student.blood;
  clone.querySelector("[data-field=squad]").dataset.squad = student.squad;
  clone.querySelector("[data-field=prefect]").dataset.prefect = student.prefect;

  // Expell

  if (student.expelled === false) {
    document.querySelector(".modalExpelled").textContent = `Is expelled: No`;

    clone.querySelector("[data-field=buttonEx]").addEventListener("click", expelClicked);

    function expelClicked() {
      this.removeEventListener("click", expelClicked);
      expelStudent(student);
    }
  } else {
    clone.querySelector("[data-field=buttonEx]").textContent = "Student expelled";
    document.querySelector(".modalExpelled").textContent = `Is expelled: Yes`;
    document.querySelector(".modalSquad").textContent = "Inquisitorial squad member: No";
    document.querySelector(".modalPrefect").textContent = "Has prefect: No";
    clone.querySelector("[data-field=buttonSq]").classList.add("hidden");
    clone.querySelector("[data-field=buttonPr]").classList.add("hidden");
  }

  // Squad

  clone.querySelector("[data-field=photo]").addEventListener("click", preShowModal);

  function preShowModal() {
    console.log("preShowModal", student);

    document.querySelector(".studentPhotoModal").src = photo.src;

    showModal(student);
  }

  if (student.squad === true) {
    clone.querySelector("[data-field=buttonSq]").textContent = "Remove from Squad";
  } else if (student.squad === false) {
    clone.querySelector("[data-field=buttonSq]").textContent = "Add to Squad";
  }

  clone.querySelector("[data-field=buttonSq]").addEventListener("click", squadStudent);

  function squadStudent() {
    console.log("squad");
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

      document.querySelector(".modalSquad").textContent = "Inquisitorial squad member: Yes";
    } else {
      student.squad = false;

      const indexStudent = readyStudents.findIndex((obj) => obj.firstName === student.firstName);
      squadedStudents.splice(indexStudent, 1);

      document.querySelector(".modalSquad").textContent = "Inquisitorial squad member: No";
    }
    buildList();
  }

  function dontMakeSquad() {
    alert();
    document.querySelector("#alertModal p:nth-of-type(2)").textContent =
      "You can only add students with pure blood or from Slytherin house to Inquisitorial Squad";
  }

  // Prefect starts

  if (student.prefect === true) {
    clone.querySelector("[data-field=buttonPr]").textContent = "Remove prefect";
  } else {
    clone.querySelector("[data-field=buttonPr]").textContent = "Add prefect";
  }

  clone.querySelector("[data-field=buttonPr]").addEventListener("click", prefectStudent);

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

      document.querySelector(".modalPrefect").textContent = "Has prefect: Yes";
    } else if (student.prefect === true) {
      student.prefect = false;

      const indexStudent = readyStudents.findIndex((obj) => obj.firstName === student.firstName);
      prefectedStudents.splice(indexStudent, 1);

      document.querySelector(".modalPrefect").textContent = "Has prefect: No";
    } else {
      console.log("only two prefects per house");
      dontMakePrefect();
    }

    buildList();
  }

  function dontMakePrefect() {
    alert();
    document.querySelector("#alertModal p:nth-of-type(2)").textContent = "Only two students from each house can be selected Prefects";
  }

  // Append clone

  document.querySelector("#studentList").appendChild(clone);
}

// Show modal

function showModal(student) {
  document.querySelector(".modalFirstname").textContent = `First name: ${student.firstName}`;

  // (student.middleName === "") - Fixing Leanne

  if (student.middleName === " " || student.middleName === "") {
    document.querySelector(".modalMiddlename").textContent = `Middle name: -`;
  } else {
    document.querySelector(".modalMiddlename").textContent = `Middle name: ${student.middleName}`;
  }
  if (student.nickName === "") {
    document.querySelector(".modalNickname").textContent = `Nickname: -`;
  } else {
    document.querySelector(".modalNickname").textContent = `Nickname: ${student.nickName}`;
  }
  document.querySelector(".modalLastname").textContent = `Lastname: ${student.lastName}`;

  document.querySelector(".modalBlood").textContent = `Blood status: ${student.blood}`;

  document.querySelector(".crestImage").src = `images/${student.house}.png`;

  document.querySelector("#modal").className = `${student.house.toLowerCase()} modal`;

  document.querySelector(".modalRight p").addEventListener("click", (e) => {
    document.querySelector("#modal").classList.add("hidden");
  });
}

// Expel student functions

function expelStudent(student) {
  if (student.firstName === "Hacker") {
    alertFromHacker();
    document.querySelector("#hackedModal p").textContent = "Hacker can't be expelled";
  } else {
    student.expelled = true;
    student.prefect = false;
    student.squad = false;

    const indexStudent = readyStudents.findIndex((obj) => obj.firstName === student.firstName);

    readyStudents.splice(indexStudent, 1);
    prefectedStudents.splice(indexStudent, 1);
    squadedStudents.splice(indexStudent, 1);

    expelledStudents.push(student);

    buildList();
  }
}

// Show expelled students

function showExpelledStudents() {
  document.querySelector("#filter span").textContent = "Filter ";
  document.querySelector("#sort span").textContent = "Sort";

  document.querySelector("input").value = "";

  if (expelledStudents.length < 1) {
    document.querySelector("h3 span").textContent = "0";
  }

  readyStudents = expelledStudents;
  displayList(readyStudents);
}

// Show students in Squad

function showSquadedStudents() {
  document.querySelector("#filter span").textContent = "Filter ";
  document.querySelector("#sort span").textContent = "Sort";

  document.querySelector("input").value = "";

  if (squadedStudents.length < 1) {
    document.querySelector("h3 span").textContent = "0";
  }

  readyStudents = squadedStudents;
  displayList(readyStudents);
}

// Show students with Prefect

function showPrefectedStudents() {
  document.querySelector("#filter span").textContent = "Filter ";
  document.querySelector("#sort span").textContent = "Sort";

  document.querySelector("input").value = "";

  if (prefectedStudents.length < 1) {
    document.querySelector("h3 span").textContent = "0";
  }

  readyStudents = prefectedStudents;
  displayList(readyStudents);
}

// Hack the system

function hackTheSystem() {
  if (alreadyHacked === false) {
    alreadyHacked = true;
    addMyself();
    messBlood();
    removeFromSquad();
  } else {
    alertFromHacker();
    document.querySelector("#hackedModal p").textContent = "The system has already been hacked";
  }
}

// Add myself

function addMyself() {
  const me = {
    firstName: "Hacker",
    middleName: "",
    lastName: "Granger",
    nickName: "",
    gender: "girl",
    house: "Slytherin",
    expelled: false,
    blood: "Pure",
    prefect: false,
    squad: false,
    prefect: false,
  };

  allStudents.unshift(me);
  console.log("All students hacked:", allStudents, "Me:", me);

  buildList();
}

// Mess blood

function messBlood() {
  allStudents.forEach((student) => {
    if (student.blood === "Pure") {
      const randomNumber = Math.floor(Math.random() * 2) + 1;
      switch (randomNumber) {
        case 1:
          student.blood = "Pure";
          break;
        case 2:
          student.blood = "Half";
          break;
        default:
          student.blood = "Muggle";
      }
    } else {
      student.blood = "Pure";
    }
  });
}

// Remove all students from Squad

function removeFromSquad() {
  squadedStudents.forEach((obj) => {
    // `${obj.firstName} ${obj.lastName} `;
    alertFromHacker();
    document.querySelector("#hackedModal p").textContent = "All students were removed from Inquisitorial Squad by Hacker";

    obj.squad = false;
  });
  squadedStudents = [];

  buildList();
}

function alert() {
  document.querySelector("#alertModal").classList.remove("hidden");

  document.querySelector("#alertModal p").addEventListener("click", (e) => {
    document.querySelector("#alertModal").classList.add("hidden");
  });
}

function alertFromHacker() {
  document.querySelector("#hackedModal").classList.remove("hidden");

  setTimeout(function () {
    document.querySelector("#hackedModal").classList.add("hidden");
  }, 3000);
}

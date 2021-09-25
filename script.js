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
};

const allStudents = [];
let readyStudents = allStudents;
let expelledStudents = [];
let filteredandSortedSt = [];

let filter = "All houses";
let sort = "";
let sortDirection = "asc";

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
  document.querySelector("#search input").addEventListener("input", searchClicked);
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
  showAllStudents(allStudents);
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
  filterPlusSort(filter);
}

function filterStudents(filteredStudents) {
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
  filterPlusSort(sort, sortDirection);
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

function filterPlusSort() {
  document.querySelector("input").value = "";
  const currentStudents = filterStudents(readyStudents);
  readyStudents = sortStudents(currentStudents);
  showAllStudents(readyStudents);
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
  showAllStudents(searchStudents);
  window.addEventListener("click", (e) => {
    document.querySelector("input").value = "";
  });
  document.querySelector("h3 span").textContent = searchStudents.length;
}

function showAllStudents(all) {
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

  // Modal

  clone.querySelector("tr").addEventListener("click", (e) => {
    document.querySelector(".studentPhotoModal").src = photo.src;
    showModal(student);
  });

  document.querySelector("#studentList").appendChild(clone);
}

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

  // expelled student styling

  if (student.expelled === false) {
    document.querySelector(".modalExpelled").textContent = `Is expelled: No`;
    document.querySelector("#expelButton").classList.remove("opacity");
    document.querySelector("#expelButton").addEventListener("click", expelClicked);
    function expelClicked() {
      document.querySelector("#expelButton").removeEventListener("click", expelClicked);
      expelStudent(student);
    }
  }
}

// Expel student functions

function expelStudent(student) {
  student.expelled = true;
  document.querySelector(".modalExpelled").textContent = `Is expelled: Yes`;
  document.querySelector("#expelButton").classList.add("opacity");
  const indexStudent = readyStudents.findIndex((obj) => obj.firstName === student.firstName);
  readyStudents.splice(indexStudent, 1);

  expelledStudents.push(student);

  showAllStudents(readyStudents);
}

function showExpelledStudents() {
  document.querySelector("#filter span").textContent = "Filter";
  document.querySelector("#sort span").textContent = "Sort";
  document.querySelector("input").value = "";
  if (expelledStudents.length < 1) {
    document.querySelector("h3 span").textContent = "0";
  }
  readyStudents = expelledStudents;
  showAllStudents(readyStudents);
}

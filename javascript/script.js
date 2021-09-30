//Create an ARRAY of possible responses. Separate each 'string' with a comma.
//   document.getElementById('canvas').onclick = function() {
//    alert("button was clicked", 'It is decidedly so.');
// };

var currentTime = new Date().getHours();
if (7 <= currentTime && currentTime < 18) {
  if (document.body) {
    document.body.className = "day";
  }
} else {
  if (document.body) {
    document.body.className = "night";
  }
}

function randomAlerts() {
  var alerts = new Array (
  "Shit I'm late for class",
  "Another email from my boss",
  "Let's take a selfie.",
  "I'm craving Thai food",
  "Venmo me",
  "When did I make this payment?",
  "Siri, how's today's the weather today?",
  "I'm gonna buy a movie ticket",
  "I'm booking a spot for the print lab at Parons",
  "This is so expensive!",
  "I need check her instagram post",
  "This ad is so annoying",
  "Why does it take so long to load this page",
  "I'm gonna get some coffee",
  );
  
  i = Math.floor(Math.random()*alerts.length);
  var div = document.getElementById('response');
  div.innerText = alerts[i];
}


// document.body.style.backgroundColor = "#FFC500";

console.clear()
console.log('lsakdfalskjdflnksd')

const config = {
  src: 'asset/Illustration.png',
  rows: 15,
  cols: 7
}

// UTILS

const randomRange = (min, max) => min + Math.random() * (max - min)

const randomIndex = (array) => randomRange(0, array.length) | 0

const removeFromArray = (array, i) => array.splice(i, 1)[0]

const removeItemFromArray = (array, item) => removeFromArray(array, array.indexOf(item))

const removeRandomFromArray = (array) => removeFromArray(array, randomIndex(array))

const getRandomFromArray = (array) => (
  array[randomIndex(array) | 0]
)

// TWEEN FACTORIES

const resetPeep = ({ stage, peep }) => {
  const direction = Math.random() > 0.5 ? 1 : -1
  // using an ease function to skew random to lower values to help hide that peeps have no legs
  const offsetY = 100 - 400 * gsap.parseEase('power2.in')(Math.random())
  const startY = stage.height - peep.height + offsetY
  let startX
  let endX
  
  if (direction === 1) {
    startX = -peep.width
    endX = stage.width
    peep.scaleX = 1
  } else {
    startX = stage.width + peep.width
    endX = 0
    peep.scaleX = -1
  }
  
  peep.x = startX
  peep.y = startY
  peep.anchorY = startY
  
  return {
    startX,
    startY,
    endX
  }
}

const normalWalk = ({ peep, props }) => {
  const {
    startX,
    startY,
    endX
  } = props

  const xDuration = 20
  const yDuration = 0.25
  
  const tl = gsap.timeline()
  tl.timeScale(randomRange(0.5, 1.5))
  tl.to(peep, {
    duration: xDuration,
    x: endX,
    ease: 'none'
  }, 0)
  tl.to(peep, {
    duration: yDuration,
    repeat: xDuration / yDuration,
    yoyo: true,
    y: startY - 10
  }, 0)
    
  return tl
}

const walks = [
  normalWalk,
]

// CLASSES

class Peep {
  constructor({
    image,
    rect,
  }) {
    this.image = image
    this.setRect(rect)
    
    this.x = 0
    this.y = 0
    this.anchorY = 0
    this.scaleX = 1
    this.walk = null
  }
  
  setRect (rect) {
    this.rect = rect
    this.width = rect[2]
    this.height = rect[3]
    
    this.drawArgs = [
      this.image,
      ...rect,
      0, 0, this.width, this.height
    ]  
  }
  
  render (ctx) {
    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.scale(this.scaleX, 1)
    ctx.drawImage(...this.drawArgs)
    ctx.restore()
  }
}

// MAIN

const img = document.createElement('img')
img.onload = init
img.src = config.src

const canvas = document.querySelector('#canvas')
const ctx = canvas.getContext('2d')

const stage = {
  width: 0,
  height: 0,
}

const allPeeps = []
const availablePeeps = []
const crowd = []

function init () {  
  createPeeps()
  
  // resize also (re)populates the stage
  resize()

  gsap.ticker.add(render)
  window.addEventListener('resize', resize)
}

function createPeeps () {
  const {
    rows,
    cols
  } = config
  const {
    naturalWidth: width,
    naturalHeight: height
  } = img
  const total = rows * cols
  const rectWidth = width / rows
  const rectHeight = height / cols
  
  for (let i = 0; i < total; i++) {
    allPeeps.push(new Peep({
      image: img,
      rect: [
        (i % rows) * rectWidth,
        (i / rows | 0) * rectHeight,
        rectWidth,
        rectHeight,
      ]
    }))
  }  
}

function resize () {
  stage.width = canvas.clientWidth
  stage.height = canvas.clientHeight
  canvas.width = stage.width * devicePixelRatio
  canvas.height = stage.height * devicePixelRatio
  
  crowd.forEach((peep) => {
    peep.walk.kill()
  })
  
  crowd.length = 0
  availablePeeps.length = 0
  availablePeeps.push(...allPeeps)
  
  initCrowd()
}

function initCrowd () {
  while (availablePeeps.length) {
    // setting random tween progress spreads the peeps out
    addPeepToCrowd().walk.progress(Math.random())
  }
}

function addPeepToCrowd () {
  const peep = removeRandomFromArray(availablePeeps)
  const walk = getRandomFromArray(walks)({
    peep,
    props: resetPeep({
      peep,
      stage,
    })
  }).eventCallback('onComplete', () => {
    removePeepFromCrowd(peep)
    addPeepToCrowd()
  })
  
  peep.walk = walk
  
  crowd.push(peep)
  crowd.sort((a, b) => a.anchorY - b.anchorY)
  
  return peep
}

function removePeepFromCrowd (peep) {
  removeItemFromArray(crowd, peep)
  availablePeeps.push(peep)
}

function render () {
  canvas.width = canvas.width
  ctx.save()
  ctx.scale(devicePixelRatio, devicePixelRatio)
  
  crowd.forEach((peep) => {
    peep.render(ctx)
  })
  
  ctx.restore()
}

function showTime(){
  var date = new Date();
  var h = date.getHours(); // 0 - 23
  var m = date.getMinutes(); // 0 - 59
  var s = date.getSeconds(); // 0 - 59
  var session = "AM";
  
  if(h == 0){
      h = 12;
  }
  
  if(h > 12){
      h = h - 12;
      session = "PM";
  }
  
  h = (h < 10) ? "0" + h : h;
  m = (m < 10) ? "0" + m : m;
  s = (s < 10) ? "0" + s : s;
  
  var time = h + ":" + m + ":" + s + " " + session;
  document.getElementById("Clock").innerText = time;
  document.getElementById("Clock").textContent = time;
  
  setTimeout(showTime, 1000);
  
}

showTime();

var element = document.querySelector('#text');
var words = ['2020','New York'];

function type(words, index){
index = index ? index : 0;
(function writer(i){
  var string = words[index];
  if(string.length <= i++){
    element.innerText = string;
    if(words[index] != words[words.length-1]) {
      setTimeout(function() {
        reverseType(words, index);
      },1000);
    }else{
      setTimeout(function() {
        reverseType(words, index);
      },2000);
    }
    return;
  }
  element.innerText = string.substring(0,i);
  var rand = Math.floor(Math.random() * (100)) + 140;
  setTimeout(function(){writer(i);},rand);
})(0)
}

function reverseType(words, index){
index = index ? index : 0;
(function writer(i){
  var string = words[index];
  if(string.length <= i++){
    element.innerText = string;
    if(words[index] != words[words.length-1]) {
      type(words, index+1);
    }else{
      type(words, 0);           
    }
    return;
  }
  element.innerText = string.substring(0,string.length - i);
  var rand = Math.floor(Math.random() * (100)) + 140;
  setTimeout(function(){writer(i);},rand);
})(0)
}

type(words);



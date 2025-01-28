const columns = document.querySelectorAll(".column");

// Group items by weight
function groupItemsByWeight(column) {
  const groups = {};

  Array.from(column.children).forEach(item => {
    const weight = item.dataset.weight;
    if (!groups[weight]) {
      groups[weight] = []; // Initialize group
    }
    groups[weight].push(item); // Add item to group
  });

  return Object.values(groups); // Return an array of groups
}

// Duplicate groups for seamless scrolling
function duplicateGroups(column, groups) {
  column.innerHTML = ""; // Clear the column
  groups.forEach(group => {
    group.forEach(item => column.appendChild(item.cloneNode(true))); // Add original group
  });
  groups.forEach(group => {
    group.forEach(item => column.appendChild(item.cloneNode(true))); // Add duplicated group
  });
}

// Initialize columns with grouped items
const groupedColumns = [];
columns.forEach(column => {
  const groups = groupItemsByWeight(column);
  groupedColumns.push(groups);
  duplicateGroups(column, groups); // Duplicate for seamless looping
});

// Precompute variables
const itemHeight = columns[0].children[0].offsetHeight; // Height of one item
const groupHeights = groupedColumns.map(groups =>
  groups.map(group => group.length * itemHeight)
); // Heights of each group
const totalHeights = groupHeights.map(heights =>
  heights.reduce((acc, h) => acc + h, 0)
); // Total height for each column
const columnOffsets = Array.from(columns).map(() => 0); // Track offsets for all columns

// Configurable variables
const animationDuration = 2000; // 2 seconds for scrolling
const pauseDuration = 1000; // 1 second pause
const columnDelays = [0, 300, 600]; // Delay in milliseconds for middle and right columns

function getRandomGroupOffset(columnIndex) {
  const groups = groupedColumns[columnIndex];
  const heights = groupHeights[columnIndex];

  // Choose a random group
  const randomGroupIndex = Math.floor(Math.random() * groups.length);

  // Calculate the offset for the start of the group
  return heights.slice(0, randomGroupIndex).reduce((acc, h) => acc + h, 0);
}

function animateColumn(column, columnIndex, targetOffset) {
  columnOffsets[columnIndex] += targetOffset;

  // If the offset exceeds the total height, wrap around
  if (columnOffsets[columnIndex] >= totalHeights[columnIndex]) {
    columnOffsets[columnIndex] %= totalHeights[columnIndex]; // Wrap back to start
  }

  // Apply the transform
  column.style.transform = `translateY(-${columnOffsets[columnIndex]}px)`;
}

function loopColumn(column, columnIndex) {
  const targetOffset = getRandomGroupOffset(columnIndex); // Calculate random group offset
  animateColumn(column, columnIndex, targetOffset); // Animate the column

  // Schedule the next animation
  setTimeout(() => {
    loopColumn(column, columnIndex); // Recursively call the loop
  }, animationDuration + pauseDuration);
}

function startLoop() {
  columns.forEach((column, columnIndex) => {
    // Start each column's animation with a delay
    setTimeout(() => {
      loopColumn(column, columnIndex);
    }, columnDelays[columnIndex]);
  });
}

// Start the looping animation
startLoop();

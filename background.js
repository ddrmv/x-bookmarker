// Add event to create bookmark on extension icon click
browser.browserAction.onClicked.addListener((tab) => {
  browser.tabs.executeScript({
    code: `
    (() => {
            console.log('This runs at ' + new Date().toISOString());
            const postUrl = window.location.href.split('?')[0];
            if (!postUrl.startsWith("https://twitter.com/") || !postUrl.includes("/status/")) {
              console.log("Throwing error: Invalid current url.")
              throw new Error("Invalid current url. Valid form: https://twitter.com/<user>/status/<post>");
            }
            const video = document.querySelector('video');
            if (video === null) {
              console.log("Throwing error: No video element was found.")
              throw new Error("No video element was found.");
            }
            const currentTime = Math.floor(video.currentTime);
            const hours = Math.floor(currentTime / 3600);
            const minutes = Math.floor((currentTime % 3600) / 60);
            const seconds = Math.floor(currentTime % 60);
            let timeString = '';
            if (currentTime >= 3600) {
              timeString = hours + ':' + ('0' + minutes).slice(-2) + ':' + ('0' + seconds).slice(-2);
            } else {
              timeString = minutes + ':' + ('0' + seconds).slice(-2);
            }
            const tweetText = document.title;
            const words = tweetText.split(' ');
            const trimmedTitle = (words.length > 7) ? words.slice(0, 7).join(' ') + '...' : words.join(' ');
            return {videoUrl: postUrl + '?t=' + currentTime, trimmedTitle: trimmedTitle, timeString: timeString};
          })();
    `,
  }).then((results) => {
    const result = results[0]; // Result from the tab where the script was executed
    const newUrl = result.videoUrl;
    const trimmedTitle = result.trimmedTitle;
    const timeString = result.timeString;
    browser.bookmarks.getTree().then((tree) => {
      const toolbarNode = tree[0].children.find(node => node.title === "Bookmarks Toolbar");
      if (toolbarNode) {
        browser.bookmarks.create({parentId: toolbarNode.id, title: `${trimmedTitle} - (${timeString})`, url: newUrl});
      }
    });
  }).catch((error) => {
    console.error("Error executing script:", error.message);
  });
});


// Function to set the correct icon
function setThemedIcon(isDarkMode) {
  const path = isDarkMode ? 'icon-dark-96.png' : 'icon-light-96.png';
  browser.browserAction.setIcon({path});
}

// Listen for when the preferred color scheme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  setThemedIcon(e.matches);
});

// Set the initial icon
setThemedIcon(window.matchMedia('(prefers-color-scheme: dark)').matches);

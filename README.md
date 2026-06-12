# RatioFixer

Find out who doesn't follow you back on Instagram — and who you haven't followed back.

## Requirements

- Python 3
- [BeautifulSoup4](https://pypi.org/project/beautifulsoup4/)

Install the dependency:

```bash
pip install beautifulsoup4
```

## Step 1 — Download your Instagram data

1. Open Instagram and go to your **Profile**
2. Tap the **menu (three lines)** in the top right
3. Go to **Account Center**
4. Tap **Your information and permissions**
5. Tap **Download your information**
6. Tap **Download or transfer information**
7. Select your account, then choose **Some of your information**
8. Scroll down and **uncheck every box** except **Followers** and **Following**
9. Tap **Download to device**
10. Set the date range to **All time**
11. Set the format to **HTML**
12. Request the download — Instagram will notify you when it's ready

Once downloaded, unzip the file. Inside you'll find `followers_1.html` and `following.html`.

## Step 2 — Set up the folder

Place these three files in the **same folder**:

```
RatioFixer/
├── compare.py
├── followers_1.html
└── following.html
```

## Step 3 — Run it

```bash
python3 compare.py
```

You'll see:

```
========================================
Total Followers: 1059
Total Following: 1374
========================================

[!] People who DON'T follow you back (454):
  - username1
  - username2
  ...

[!] People you don't follow back (108):
  - username3
  - username4
  ...
```

## Note on counts

Your follower/following counts may differ slightly from what the Instagram app shows. This is normal — the HTML export is a snapshot from when you requested the download, and the live count reflects any changes since then.

from bs4 import BeautifulSoup

def extract_usernames(html_file):
    usernames = set()
    try:
        with open(html_file, 'r', encoding='utf-8') as f:
            soup = BeautifulSoup(f.read(), 'html.parser')
            
            # Instagram formats lists as links pointing to the profile URL
            for link in soup.find_all('a'):
                href = link.get('href', '')
                
                # Check if it's a profile link (instagram.com/username)
                if 'instagram.com/' in href:
                    username = href.split('instagram.com/')[-1].strip('/')
                    if username.startswith('_u/'):
                        username = username[3:]
                    
                    # Ignore any general Instagram pages that aren't users
                    if username and username not in ['legal', 'explore', 'about', 'developer']:
                        usernames.add(username)
                        
    except FileNotFoundError:
        print(f"Error: Could not find {html_file}.")
    return usernames

# Make sure these match your actual file names in your folder!
followers_file = 'followers_1.html'  # Changed to match your terminal error
following_file = 'following.html'

followers = extract_usernames(followers_file)
following = extract_usernames(following_file)

# The logic:
not_following_back = following - followers
you_dont_follow_back = followers - following

print("=" * 40)
print(f"Total Followers Found: {len(followers)}")
print(f"Total Following Found: {len(following)}")
print("=" * 40)

print(f"\n[!] People who DON'T follow you back ({len(not_following_back)}):")
for user in sorted(not_following_back):
    print(f"  - {user}")

print(f"\n[!] People you don't follow back ({len(you_dont_follow_back)}):")
for user in sorted(you_dont_follow_back):
    print(f"  - {user}")
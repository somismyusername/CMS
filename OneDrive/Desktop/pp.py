import shutil, os, re

# Create a regex that matches files with the American date format.
datePattern = re.compile(r"""^(.*?)       # all text before the date
    ((0|1)?\d)-                         # one or two digits for the month
    ((0|1|2|3)?\d)-                     # one or two digits for the day
    ((19|20)\d\d)                       # four digits for the year
    (.*?)$                              # all text after the date
    """, re.VERBOSE)

hello = input('enter the path : \n')
# Loop over the files in the working directory.
for amerFilename in os.listdir(hello):
    mo = datePattern.search(amerFilename)

    # Skip files without a date.
    if mo is None:
        continue

    # Get the different parts of the filename.
    beforePart = mo.group(1)
    monthPart  = mo.group(2)
    dayPart    = mo.group(4)
    yearPart   = mo.group(6)
    afterPart  = mo.group(7)  # Change this to group(7)

    # Form the European-style filename.
    euroFilename = beforePart + dayPart + '-' + monthPart + '-' + yearPart + afterPart

    # Get the full, absolute file paths.
    absWorkingDir = os.path.abspath('.')
    amerFilePath = os.path.join(hello, amerFilename)  # Change this to the input path
    euroFilePath = os.path.join(hello, euroFilename)  # Change this to the input path

    # Rename the files.
    print(f'Renaming "{amerFilename}" to "{euroFilename}"...')

    # Uncomment the line below after testing
    shutil.move(amerFilePath, euroFilePath)

version_info = (0, 10, 3, 'final', 0)  # cranko project-version tuple

_specifier_ = {'alpha': '.a', 'beta': '.b', 'candidate': '.rc', 'final': '', 'dev': '.dev'}

__version__ = '%s.%s.%s%s' % (
    version_info[0],
    version_info[1],
    version_info[2],
    '' if version_info[3] == 'final' else _specifier_[version_info[3]]+str(version_info[4])
)

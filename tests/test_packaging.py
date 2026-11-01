import unittest,importlib.util
from pathlib import Path
from html.parser import HTMLParser
ROOT=Path(__file__).resolve().parents[1]
s=importlib.util.spec_from_file_location('builder',ROOT/'scripts/build_lesson.py');b=importlib.util.module_from_spec(s);s.loader.exec_module(b)
class Frames(HTMLParser):
 def __init__(self):super().__init__();self.frames=[]
 def handle_starttag(self,t,a):
  if t=='iframe':self.frames.append(dict(a))
class TestPackaging(unittest.TestCase):
 def test_themes_and_isolation(self):
  for theme in b.THEMES:
   result=b.build([ROOT/'fragments/sampling-distribution.html']*2,theme,'A < B')
   p=Frames();p.feed(result);self.assertEqual(len(p.frames),2)
   for f in p.frames:
    self.assertEqual(f['sandbox'],'allow-scripts');self.assertIn('data-sci-example="sampling-distribution"',f['srcdoc']);self.assertIn('--foreground:',f['srcdoc']);self.assertIn("e.source!==parent",f['srcdoc'])
   self.assertIn('A &lt; B',result);self.assertIn('f.contentWindow===e.source',result)
 def test_theme_contract(self):
  for tokens in b.THEMES.values():self.assertEqual(set(tokens),set(b.THEMES['warm']))
if __name__=='__main__':unittest.main()

<?xml version="1.0" encoding="utf-8"?>
<schema xmlns="http://purl.oclc.org/dsdl/schematron"><title>ISO Schematron rules</title><ns prefix="tei" uri="http://www.tei-c.org/ns/1.0"/><ns prefix="rng" uri="http://relaxng.org/ns/structure/1.0"/><pattern id="ptr-constraint-ptrAtts"><rule context="tei:ptr"><report test="@target and @cRef">the target and cRef
	attributes are mutually exclusive.</report></rule></pattern><pattern id="relation-constraint-activemutual"><rule context="tei:relation"><report test="@active and @mutual">Only one of the attributes
	'active' and 'mutual' may be supplied</report></rule></pattern><pattern id="relation-constraint-activepassive"><rule context="tei:relation"><report test="@passive and not(@active)">the attribute 'passive'
	may be supplied only if the attribute 'active' is
	supplied</report></rule></pattern></schema>

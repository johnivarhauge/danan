<?xml version="1.0"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

    <xsl:template match="/">
        <html>
            <head></head>
            <body>
        <h1>Deltagere</h1>
        <table border="1">
            <tr>
                <th>Id</th> <th>Tittel</th> <th>Navn</th> <th>GruppeId</th>
            </tr>
            <xsl:for-each select="deltagere/oss">
                <xsl:sort select="id"/>
                    <tr>
                    <td><xsl:value-of select="id"/></td>
                    <td><xsl:value-of select="tittel"/></td>
                    <td><xsl:value-of select="navn"/></td>
                    <td><xsl:value-of select="gruppeid"/></td>
                </tr>
            </xsl:for-each>
        </table>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>